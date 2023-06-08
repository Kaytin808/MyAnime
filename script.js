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

function displayAnimeResults(animeData) {
  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '';

  animeData.forEach(anime => {
    var listItem = document.createElement('li');
    listItem.className = 'box';
    listItem.innerHTML = `
      <div class="content">
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
      </div>
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

function displayEpisodeGuide(animeData) {
  var episodeGuide = document.createElement('div');
  episodeGuide.className = 'episode-guide';

  episodeGuide.innerHTML = `
    <div class="anime-info">
      <h3 class="title">${animeData.title}</h3>
      <img src="${animeData.image}" alt="${animeData.title}" style="max-width: 200px;">
    </div>
    <div class="anime-description-container">
      <div class="anime-description collapsed">
        <p>${animeData.description || 'No description available.'}</p>
        <button onclick="toggleDescription()" class="button is-small is-rounded">Show More</button>
      </div>
    </div>
    <div class="episode-guide-content">
      <h4>Episode Guide:</h4>
      <div class="field has-addons">
        <div class="control is-expanded">
          <div class="select">
            <select id="episodeSelect">
              ${animeData.episodes.map(episode => `<option value="${episode.id}">Episode ${episode.number}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="control">
          <button class="button is-primary" onclick="playSelectedEpisode()">
            <span class="icon">
              <i class="fas fa-play"></i>
            </span>
            <span>Play</span>
          </button>
        </div>
      </div>
      <div class="video-player" style="display: none;">
        <video id="player" controls class="video"></video>
      </div>
    </div>
  `;

  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '';
  animeList.appendChild(episodeGuide);
}
function toggleDescription() {
  var descriptionContainer = document.querySelector('.anime-description');
  var showMoreButton = document.querySelector('.anime-description button');

  if (descriptionContainer.classList.contains('collapsed')) {
    descriptionContainer.classList.remove('collapsed');
    showMoreButton.textContent = 'Show Less';
    descriptionContainer.style.maxHeight = 'none'; // Set max-height to none
  } else {
    descriptionContainer.classList.add('collapsed');
    showMoreButton.remove(); // Remove the "Show More" button
    descriptionContainer.style.maxHeight = '100px'; // Set max-height to the desired collapsed height
  }
}