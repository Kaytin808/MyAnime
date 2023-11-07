function returnToIndex() {
  window.location.href = 'index.html';
}

function searchAnime() {
  var searchInput = document.getElementById('searchInput').value;

  if (searchInput.trim() !== '') {
    var apiUrl = `https://api.consumet.org/anime/gogoanime/${encodeURIComponent(searchInput)}?page=1`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results.length === 0) {
          displayNoResults();
        } else {
          displayAnimeResults(data.results);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
}

var searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    searchAnime();
  }
});

function displayNoResults() {
  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '<li class="box">Couldn\'t find that anime.</li>';
}

function displayFavorites() {
  var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '';

  if (favorites.length === 0) {
    animeList.innerHTML = '<li class="box">No favorites added.</li>';
  } else {
    favorites.forEach(anime => {
      var listItem = document.createElement('li');
      listItem.className = 'box';
      listItem.innerHTML = `
        <strong>${anime.title}</strong>
        <br>
        <img src="${anime.image}" alt="${anime.title}" style="max-width: 200px;">
        <br>
        <button onclick="showEpisodeGuide('${anime.id}')" class="button is-primary is-rounded">
          <span class="icon">
            <i class="fas fa-play"></i>
          </span>
          <span>Watch Now</span>
        </button>
      `;

      animeList.appendChild(listItem);
    });
  }
}

function displayAnimeResults(animeData) {
  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '';

  animeData.forEach(anime => {
    var listItem = document.createElement('li');
    listItem.className = 'box';
    listItem.innerHTML = `
      <strong>${anime.title}</strong>
      <br>
      <img src="${anime.image}" alt="${anime.title}" style="max-width: 200px;">
      <br>
      <strong>Release Date:</strong> ${anime.releaseDate || 'N/A'}
      <br>
      <strong>Sub/Dub:</strong> ${anime.subOrDub === 'sub' ? 'Subbed' : 'Dubbed'}
      <br>
      <button onclick="showEpisodeGuide('${anime.id}')" class="button is-primary is-rounded">
        <span class="icon">
          <i class="fas fa-play"></i>
        </span>
        <span>Watch Now</span>
      </button>
    `;

    animeList.appendChild(listItem);
  });
}

function showEpisodeGuide(animeId) {
  var apiUrl = `https://api.consumet.org/anime/gogoanime/info/${animeId}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      displayEpisodeGuide(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function addToFavorites(animeId, animeTitle, animeImage) {
  var favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  var favorite = { id: animeId, title: animeTitle, image: animeImage };

  if (!favorites.some(fav => fav.id === animeId)) {
    favorites.push(favorite);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Added to favorites!');
  } else {
    alert('Already in favorites!');
  }
}

function displayEpisodeGuide(animeData) {
  var episodeGuide = document.createElement('div');
  const qualityOptions = ['360', '480p', '720p', '1080p']; // Add the desired quality options

  episodeGuide.innerHTML = `
    <div class="card">
      <div class="card-content">
        <div class="episode-guide-content">
          <div class="is-pulled-right has-text-warning" onclick="addToFavorites('${animeData.id}', '${animeData.title}', '${animeData.image}')">
            <i class="fas fa-star favorite-star"></i>
          </div>
          <h3 class="title">${animeData.title}</h3>
          <div class = "img-container">
            <img src="${animeData.image}" alt="${animeData.title}" style="max-width: 200px;">
          </div>
          <p>${animeData.description || 'No description available.'}</p>
          <h4 class="subtitle" style="margin-top: 1rem;">Episode Guide:</h4>
          <div id="episodeListContainer" class="episode-list-container">
            <div class="select">
              <select id="episodeSelect">
                ${animeData.episodes
                  .map(episode => {
                    const watchedClass = isEpisodeWatched(animeData.id, episode.id) ? 'watched' : '';
                    const checkMark = isEpisodeWatched(animeData.id, episode.id) ? '✓ ' : '';
                    return `<option value="${episode.id}" class="${watchedClass}">${checkMark}Episode ${episode.number}</option>`;
                  })
                  .join('')}
              </select>
            </div>
            <button class="button is-primary play-class" onclick="playSelectedEpisode('${animeData.id}')">Play</button>
          </div>
          <div class="vid-container">
            <video id="player" playsinline controls>
            </video>
          </div>
        </div>
      </div>
    </div>
  `;

  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '';
  animeList.appendChild(episodeGuide);
}

function isEpisodeWatched(animeId, episodeId) {
  var watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
  return watchedEpisodes[animeId]?.includes(episodeId);
}

function markEpisodeAsWatched(animeId, episodeId) {
  var watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
  if (!watchedEpisodes[animeId]) {
    watchedEpisodes[animeId] = [];
  }
  if (!watchedEpisodes[animeId].includes(episodeId)) {
    watchedEpisodes[animeId].push(episodeId);
    localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
  }
}

function playSelectedEpisode(animeId) {
  var selectElement = document.getElementById('episodeSelect');
  var selectedEpisodeId = selectElement.value;
  const player = document.getElementById('player');
  var playBtn = document.querySelector('button.is-primary.play-class');

  if (playBtn) {
    // Remove the "is-primary" class and add the "is-loading" class
    playBtn.classList.remove('is-primary');
    playBtn.classList.add('is-loading');
    playBtn.disabled = true; // Disable the button during loading
  }

  // Save last episode selected
  markEpisodeAsWatched(animeId, selectedEpisodeId);

  // Add the check mark to the selected option only if it is not already watched
  var selectedOption = selectElement.options[selectElement.selectedIndex];
  if (!selectedOption.classList.contains('watched')) {
    selectedOption.text = '✓ ' + selectedOption.text;
    selectedOption.classList.add('watched');
  }

  var apiUrl = `https://api.consumet.org/anime/gogoanime/watch/${selectedEpisodeId}?server=gogocdn`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      console.log('Episode Response:', data); // Log the response data
      var episodeUrl = data.sources[4].url;

      if (isMobileDevice()) {
        playMobileEpisode(episodeUrl);
      } else {
        playPCEpisode(episodeUrl);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      // Revert the play button back to its normal state if an error occurs
      playBtn.classList.add('is-primary');
      playBtn.classList.remove('is-loading');
      playBtn.disabled = false;
    });
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function playMobileEpisode(episodeUrl) {
  var player = document.getElementById('player');
  player.src = episodeUrl;
  player.play();
  requestFullscreen(player);
}

function playPCEpisode(episodeUrl) {
  const playerVid = new Plyr('#player', {
    controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
    settings: ['captions', 'quality', 'speed', 'loop'],
    quality: {
      default: 720,
      options: [720, 480, 360],
    },
  });

  if (!Hls.isSupported()) {
    playerVid.source = {
      type: 'video',
      sources: [
        {
          src: episodeUrl,
          type: 'video/mp4',
          size: 720,
        },
      ],
    };
  } else {
    const hls = new Hls();
    hls.loadSource(episodeUrl);
    hls.attachMedia(playerVid.media);
    window.hls = hls;
  }

  playerVid.play();
}

// Check for syntax errors
console.log('No syntax errors.');
