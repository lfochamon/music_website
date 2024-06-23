const mediaPlayers = document.getElementsByClassName('media-player');

for (var i = 0; i < mediaPlayers.length; i++) {
  const mediaPlayer = mediaPlayers.item(i);
  const audios = mediaPlayer.querySelectorAll('#audio');

  mediaPlayer.querySelector('#play-button').addEventListener('click', playPause);

  audios.item(0).addEventListener('loadedmetadata', initializePlayer);
  for (var j = 0; j < audios.length; j++) {
    audios.item(j).addEventListener('timeupdate', updateProgress);
    audios.item(j).addEventListener('ended', nextSongOrMediaPlayer);
  }

  mediaPlayer.querySelector('#progress-bar-wrapper').addEventListener('click', setProgress);
}

window.addEventListener('beforeunload', pauseAll);


////////////////////////////////////////////////////////////////////////////////
// Event handlers //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Initialization
function initializePlayer(e) {
  const audio = e.target;
  const mediaPlayer = audio.closest('.media-player')

  updateProgressBar(mediaPlayer, 0);
  updateTimeMarker(mediaPlayer, audio.duration);
  updateTitle(mediaPlayer);

  const tracks = mediaPlayer.querySelectorAll('#audio').length
  if (tracks > 1) {
    mediaPlayer.querySelector('#prev-button').addEventListener('click', prevSong);
    mediaPlayer.querySelector('#prev-button').style.color = '#000';
    mediaPlayer.querySelector('#next-button').addEventListener('click', nextSong);
    mediaPlayer.querySelector('#next-button').style.color = '#000';

    mediaPlayer.setAttribute('data-track', '0');
    mediaPlayer.setAttribute('data-tracks', tracks);
  }
}

// Play/pause button
function playPause(e) {
  const mediaPlayer = e.target.closest('.media-player');
  const isPlaying = mediaPlayer.classList.contains('play');

  if (isPlaying) {
    pauseAudio(mediaPlayer);
  } else {
    pauseAll();
    playAudio(mediaPlayer);
  }
}

// Previous song button
function prevSong(e) {
  const mediaPlayer = e.target.closest('.media-player');
  navigateTracks(mediaPlayer, -1);
}

// Next song button
function nextSong(e) {
  const mediaPlayer = e.target.closest('.media-player');
  navigateTracks(mediaPlayer, +1);
}

// Update media player progress bar
function updateProgress(e) {
  const mediaPlayer = e.target.closest('.media-player');

  if (mediaPlayer.classList.contains('play')) {
    updateProgressBar(mediaPlayer);
    updateTimeMarker(mediaPlayer);
  }
}

// Set track time to a specific point
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const mediaPlayer = e.target.closest('.media-player');
  const audio = getCurrentTrack(mediaPlayer);

  setPlayerTime(mediaPlayer, (clickX / width) * audio.duration);
  updateProgressBar(mediaPlayer);
  updateTimeMarker(mediaPlayer);
}

// Stop media player and start next song/media player if 'continuous' is set
function nextSongOrMediaPlayer(e) {
  const mediaPlayer = e.target.closest('.media-player');

  // Pause media player
  pauseAudio(mediaPlayer);

  if (mediaPlayer.classList.contains('continuous')) {
    const tracks = mediaPlayer.getAttribute('data-tracks');
    const currentTrack = mediaPlayer.getAttribute('data-track');

    if (tracks === null || parseInt(currentTrack) >= parseInt(tracks) - 1) {
      // Go to next media player
      navigateMediaPlayer(mediaPlayer, +1);
    } else {
      // Go to next track
      navigateTracks(mediaPlayer, +1);
      playAudio(mediaPlayer);
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// Media player functions //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Pick currently playing audio
function getCurrentTrack(mediaPlayer) {
  const audios = mediaPlayer.querySelectorAll('#audio');

  if (audios.length > 1) {
    const currentTrack = parseInt(mediaPlayer.getAttribute('data-track'));
    audio = audios.item(currentTrack);
  } else {
    audio = audios.item(0);
  }

  return audio;
}

// Hit pause on media player
function pauseAudio(mediaPlayer) {
  const playButton = mediaPlayer.querySelector('#play-button i.fas');
  const audio = getCurrentTrack(mediaPlayer);

  // Update player status and buttons states
  mediaPlayer.classList.remove('play');
  playButton.classList.remove('fa-pause');
  playButton.classList.add('fa-play');

  // Pause audio
  audio.pause();
}

// Pause all media players
function pauseAll() {
  for (var i = 0; i < mediaPlayers.length; i++) {
    pauseAudio(mediaPlayers.item(i));
  }
}

// Hit play on media player (pause all other players)
function playAudio(mediaPlayer) {
  const playButton = mediaPlayer.querySelector('#play-button i.fas');
  const audio = getCurrentTrack(mediaPlayer);

  mediaPlayer.classList.add('play');
  playButton.classList.remove('fa-play');
  playButton.classList.add('fa-pause');

  // Google analytics integration
  gtag('event', 'embedded_play', {'event_label' : audio.src.split(/[\\/]/).pop()});

  audio.play();
}

// Navigate through tracks in media player
function navigateTracks(mediaPlayer, step) {
  var trackNumber = parseInt(mediaPlayer.getAttribute('data-track'));
  var tracks = parseInt(mediaPlayer.getAttribute('data-tracks'));
  const isPlaying = mediaPlayer.classList.contains('play');

  if (isPlaying) {
    pauseAudio(mediaPlayer);
  }

  trackNumber += step;
  if (trackNumber > tracks - 1) {
    trackNumber = 0;
  } else if (trackNumber < 0) {
    trackNumber = tracks - 1;
  }
  mediaPlayer.setAttribute('data-track', trackNumber.toString());

  const audio = getCurrentTrack(mediaPlayer);
  updateProgressBar(mediaPlayer, 0);
  setPlayerTime(mediaPlayer, 0);
  updateTimeMarker(mediaPlayer, audio.duration);
  updateTitle(mediaPlayer);

  if (isPlaying) {
    playAudio(mediaPlayer);
  }
}

// Navigate through media players in page
function navigateMediaPlayer(mediaPlayer, step) {
  // Find current media player index
  var mediaPlayerIdx = null;
  for (var i = 0; i < mediaPlayers.length; i++) {
    if (mediaPlayer === mediaPlayers.item(i)) {
      mediaPlayerIdx = i;
      break;
    }
  }
  pauseAll();

  if (mediaPlayerIdx !== null) {
    mediaPlayerIdx += step;
    if (mediaPlayerIdx >= 0 && mediaPlayerIdx < mediaPlayers.length) {
      // Start next media player
      const mediaPlayer = mediaPlayers.item(mediaPlayerIdx);
      navigateTracks(mediaPlayer, Number.POSITIVE_INFINITY);
      playAudio(mediaPlayer);
    }
  }
}

// Update media player progress bar
function updateProgressBar(mediaPlayer, percent) {
  if (percent === undefined) {
    audio = getCurrentTrack(mediaPlayer);
    percent = (audio.currentTime/audio.duration) * 100;
  }

  if (percent > 100) {
    percent = 100;
  }

  const progressBar = mediaPlayer.querySelector('#progress-bar');
  progressBar.style.width = `${percent}%`;
}

// Update media player progress time marker
function updateTimeMarker(mediaPlayer, time) {
  if (time === undefined) {
    audio = getCurrentTrack(mediaPlayer);
    time = audio.currentTime;
  }

  const currentMinute = Math.floor(time / 60);
  const currentSecond = Math.floor(time % 60);

  const progressTime = mediaPlayer.querySelector('#progress-time');
  progressTime.innerHTML = currentMinute.toString().padStart(2,'0') + ':' + currentSecond.toString().padStart(2,'0');
}

// Update media player song title
function updateTitle(mediaPlayer) {
  audio = getCurrentTrack(mediaPlayer);
  const url = audio.src;
  const title = decodeURI(url.split("/").pop().replace(/\.[^/.]+$/, ""));

  const mediaTitle = mediaPlayer.querySelector('#media-title');
  mediaTitle.innerHTML = "<a href='" + url + "' download>" + title + "</a>";
}

// Set audio playing time
function setPlayerTime(mediaPlayer, time) {
  const audio = getCurrentTrack(mediaPlayer);

  if (time < audio.duration) {
    audio.currentTime = time;
  } else {
    audio.currentTime = audio.duration;
  }
}
