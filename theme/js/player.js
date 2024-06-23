const mediaPlayers = document.getElementsByClassName('media-player');

for (var i = 0; i < mediaPlayers.length; i++) {
  initialize(mediaPlayers.item(i));
}

window.addEventListener('beforeunload', pauseAll);


////////////////////////////////////////////////////////////////////////////////
// Event handlers //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Initialization
function initialize(mediaPlayer) {
  const audio = mediaPlayer.querySelector('#audio');

  updateProgressBar(mediaPlayer, 0);
  updateTimeMarker(mediaPlayer, audio.duration);

  mediaPlayer.querySelector('#play-button').addEventListener('click', playPause);
  mediaPlayer.querySelector('#progress-bar-wrapper').addEventListener('click', setProgress);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', nextSong);
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
function nextSong(e) {
  const mediaPlayer = e.target.closest('.media-player');

  // Pause media player
  pauseAudio(mediaPlayer);

  if (mediaPlayer.classList.contains('continuous')) {
    navigateMediaPlayer(mediaPlayer, +1);
  }
}


////////////////////////////////////////////////////////////////////////////////
// Media player functions //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Pick currently playing audio
function getCurrentTrack(mediaPlayer) {
  return mediaPlayer.querySelectorAll('#audio').item(0);
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

  audio.play();
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
      setPlayerTime(mediaPlayer, 0);
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

// Set audio playing time
function setPlayerTime(mediaPlayer, time) {
  const audio = getCurrentTrack(mediaPlayer);

  if (time < audio.duration) {
    audio.currentTime = time;
  } else {
    audio.currentTime = audio.duration;
  }
}
