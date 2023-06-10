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
  episodeGuide.innerHTML = `
    <div class="card">
      <div class="card-content">
        <div class="episode-guide-content">
          <div class="is-pulled-right has-text-warning" onclick="addToFavorites('${animeData.id}', '${animeData.title}', '${animeData.image}')">
            <i class="fas fa-star favorite-star"></i>
          </div>
          <h3 class="title">${animeData.title}</h3>
          <img src="${animeData.image}" alt="${animeData.title}" style="max-width: 200px;">
          <p>${animeData.description || 'No description available.'}</p>
          <h4 class="subtitle" style="margin-top: 1rem;">Episode Guide:</h4>
          <div id="episodeListContainer" class="episode-list-container">
            <div class="select">
              <select id="episodeSelect">
                ${animeData.episodes.map(episode => {
                  const watchedClass = isEpisodeWatched(animeData.id, episode.id) ? 'watched' : '';
                  const checkMark = isEpisodeWatched(animeData.id, episode.id) ? '✓ ' : '';
                  return `<option value="${episode.id}" class="${watchedClass}">${checkMark}Episode ${episode.number}</option>`;
                }).join('')}
              </select>
            </div>
            <button class="button is-primary play-class" onclick="playSelectedEpisode('${animeData.id}')">Play</button>
          </div>
          <div class="video-player" style="display: none;">
            <video id="player" controls class="video"></video>
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

  var playBtn = document.querySelector("button.is-primary.play-class");

  if (playBtn) {
    // Remove the "is-primary" class and add the "is-loading" class
    playBtn.classList.remove("is-primary");
    playBtn.classList.add("is-loading");
    playBtn.disabled = true; // Disable the button during loading
  }

  console.log(playBtn);

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
      var episodeUrl = data.sources[0].url;
      var videoPlayer = document.getElementById('player');

      videoPlayer.src = episodeUrl;
      videoPlayer.load();

      videoPlayer.addEventListener('loadeddata', function() {
        playBtn.classList.add("is-primary");
        playBtn.classList.remove("is-loading");
        playBtn.disabled = false;
      });

      // Revert the play button back to its normal state if an error occurs
      videoPlayer.addEventListener('error', function() {
        console.error('Error loading the video');
        playBtn.classList.add("is-primary");
        playBtn.classList.remove("is-loading");
        playBtn.disabled = false;
      });

      videoPlayer.play(); // Play the episode
    })
    .catch(error => {
      console.error('Error:', error);
      // Revert the play button back to its normal state if an error occurs
      playBtn.classList.add("is-primary");
      playBtn.classList.remove("is-loading");
      playBtn.disabled = false;
    });
}