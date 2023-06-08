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

function displayEpisodeGuide(animeData) {
  var episodeGuide = document.createElement('div');
  episodeGuide.innerHTML = `
    <h3>${animeData.title}</h3>
    <img src="${animeData.image}" alt="${animeData.title}" style="max-width: 200px;">
    <p>${animeData.description || 'No description available.'}</p>
    <h4>Episode Guide:</h4>
    <div id="episodeListContainer" class="episode-list-container">
  <div class="select">
    <select id="episodeSelect">
      ${animeData.episodes.map(episode => `<option value="${episode.id}">Episode ${episode.number}</option>`).join('')}
    </select>
  </div>
  <button class="button is-primary" onclick="playSelectedEpisode()">Play</button>
</div>
    <div class="video-player" style="display: none;">
      <video id="player" controls class="video"></video>
    </div>
  `;

  var animeList = document.getElementById('animeList');
  animeList.innerHTML = '';
  animeList.appendChild(episodeGuide);
}

function playSelectedEpisode() {
  var selectElement = document.getElementById('episodeSelect');
  var selectedEpisodeId = selectElement.value;

  var apiUrl = `https://api.consumet.org/anime/gogoanime/watch/${selectedEpisodeId}?server=gogocdn`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      console.log('Episode Response:', data); // Log the response data
      var episodeUrl = data.sources[0].url;
      var videoPlayer = document.getElementById('player');
      videoPlayer.src = episodeUrl;
      videoPlayer.load();
      videoPlayer.play(); // Play the episode

      // Request fullscreen
      if (videoPlayer.requestFullscreen) {
        videoPlayer.requestFullscreen();
      } else if (videoPlayer.mozRequestFullScreen) {
        videoPlayer.mozRequestFullScreen();
      } else if (videoPlayer.webkitRequestFullscreen) {
        videoPlayer.webkitRequestFullscreen();
      } else if (videoPlayer.msRequestFullscreen) {
        videoPlayer.msRequestFullscreen();
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
}