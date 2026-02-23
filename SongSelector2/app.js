const state = {
  songs: [],
  filtered: [],
  sort: { column: null, asc: true },
  favouritesOnly: false,
};

const $ = (s) => document.querySelector(s);
let songContainer;
const audio = $("#audio");
const nowPlaying = $("#nowPlaying");

/* -------- ID GENERATOR ------------ */
function generateId(song) {
  return (
    song.artist.trim().toLowerCase().replace(/\s+/g, "_") +
    "__" +
    song.title.trim().toLowerCase().replace(/\s+/g, "_")
  );
}

/* -------- LOCAL STORAGE ----------- */
const STORAGE_KEY = "songselector_favourites";

function loadFavourites() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  state.songs.forEach((song) => {
    song.favourite = stored.includes(song.id);
  });
}

function saveFavourites() {
  const favIds = state.songs.filter((s) => s.favourite).map((s) => s.id);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(favIds));
}

const CUSTOM_KEY = "songselector_custom_songs";

function loadCustomSongs() {
  return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
}

function saveCustomSongs(songs) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(songs));
}

/* ---------------- INIT ---------------- */
document.addEventListener("DOMContentLoaded", async () => {
  songContainer = document.getElementById("songContainer");
  await loadSongs();
  bindUI();
  render();
});

/* ---------------- LOAD ---------------- */
async function loadSongs() {
  const res = await fetch("songs.json");
  const baseSongs = await res.json();

  const customSongs = loadCustomSongs();

  const combined = [...baseSongs, ...customSongs];

  state.songs = combined.map((s, index) => {
    const id = s.id || generateId(s);

    return {
      id,
      number: s.number ?? index + 1,
      favourite: false,
      artist: s.artist,
      title: s.title,
      tuning: s.tuning,
      mp3: s.mp3 || "",
    };
  });

  loadFavourites();
  state.filtered = [...state.songs];
}

/* ---------------- RENDER ---------------- */
function render() {
  songContainer.innerHTML = "";

  const term = $("#search").value.toLowerCase();

  state.filtered = state.songs.filter((s) => {
    if (state.favouritesOnly && !s.favourite) return false;
    return `${s.artist} ${s.title} ${s.tuning}`.toLowerCase().includes(term);
  });

  const frag = document.createDocumentFragment();

  state.filtered.forEach((song) => {
    const card = document.createElement("div");
    card.className = "song-card";
    card.id = `song-${song.id}`;

    card.innerHTML = `
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
        <div class="song-meta">#${song.number} • ${song.tuning || "Standard"}</div>
      </div>

      <div class="song-actions">
        <button data-play="${song.id}">
  ${currentSongId === song.id && !audio.paused ? "⏸" : "▶"}
</button>
        <button data-edit="${song.id}">✎</button>
        <button data-google="${song.id}">G</button>
        <button data-ug="${song.id}">UG</button>
        <button class="fav ${song.favourite ? "active" : ""}" data-fav="${song.id}">
          ♥
        </button>
      </div>
    `;

    frag.appendChild(card);
  });

  songContainer.appendChild(frag);
}

/* ---------------- EVENTS ---------------- */
function bindUI() {
  const search = $("#search");
  if (search) search.addEventListener("input", render);

  const menu = document.querySelector(".menu");
  if (menu) {
    menu.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;

      if (action === "random") pickRandom();
      if (action === "toggleFavs") {
        state.favouritesOnly = !state.favouritesOnly;
        render();
      }
      if (action === "theme") toggleTheme();
      if (action === "reset") {
        state.sort = { column: null, asc: true };
        state.songs.sort((a, b) => a.number - b.number);
        render();
      }
      if (action === "addSong") {
        openModal(
          "Add Song",
          `
    <label>Artist</label>
    <input id="newArtist" placeholder="Artist" />
    <label>Title</label>
    <input id="newTitle" placeholder="Song Title" />
    <label>Tuning</label>
    <input id="newTuning" placeholder="Tuning" />
    <label>MP3 Filename</label>
    <input id="newMp3" placeholder="(Optional)" />
    `,
          () => {
            const newSong = {
              artist: document.getElementById("newArtist").value,
              title: document.getElementById("newTitle").value,
              tuning: document.getElementById("newTuning").value,
              mp3: document.getElementById("newMp3").value,
            };

            newSong.id = generateId(newSong);
            newSong.number = state.songs.length + 1;

            const custom = loadCustomSongs();
            custom.push(newSong);
            saveCustomSongs(custom);

            state.songs.push({ ...newSong, favourite: false });
            render();
          },
        );
      }

      if (action === "bulkAdd") {
        openModal(
          "Bulk Add (Paste JSON Array)",
          `<textarea id="bulkInput" rows="8" placeholder='[{"artist":"A","title":"B"}]'></textarea>`,
          () => {
            try {
              const parsed = JSON.parse(
                document.getElementById("bulkInput").value,
              );
              const custom = loadCustomSongs();

              parsed.forEach((song) => {
                song.id = generateId(song);
                song.number = state.songs.length + 1;
                custom.push(song);
                state.songs.push({ ...song, favourite: false });
              });

              saveCustomSongs(custom);
              render();
            } catch {
              alert("Invalid JSON");
            }
          },
        );
      }
    });
  }

  if (songContainer) {
    songContainer.addEventListener("click", (e) => {
      const id = Object.values(e.target.dataset)[0];
      if (!id) return;

      const song = state.songs.find((s) => s.id === id);
      if (!song) return;

      if (e.target.dataset.play) playSong(song);
      if (e.target.dataset.edit) editSong(song);
      if (e.target.dataset.google) openGoogle(song);
      if (e.target.dataset.ug) openUG(song);
      if (e.target.dataset.fav) {
        song.favourite = !song.favourite;
        saveFavourites();
        render();
      }
    });
  }
}

/* ---------------- ACTIONS ---------------- */
let currentSongId = null;

function playSong(song) {
  const newSrc = song.mp3
    ? `audio/${song.mp3}`
    : `audio/${song.artist} - ${song.title}.mp3`;

  if (currentSongId === song.id) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }

    render();
    return;
  }

  currentSongId = song.id;
  audio.src = newSrc;
  audio.play();
  nowPlaying.textContent = `Now Playing: ${song.artist} - ${song.title}`;

  render();
}

audio.addEventListener("ended", () => {
  currentSongId = null;
});

function openGoogle(song) {
  const q = encodeURIComponent(`${song.artist} ${song.title}`);
  window.open(`https://www.google.com/search?q=${q}`, "_blank");
}

function openUG(song) {
  const q = encodeURIComponent(`${song.artist} ${song.title}`);
  window.open(
    `https://www.ultimate-guitar.com/search.php?search_type=title&value=${q}`,
    "ug",
    "width=1000,height=700",
  );
}

function pickRandom() {
  if (state.filtered.length === 0) return;

  const randomSong =
    state.filtered[Math.floor(Math.random() * state.filtered.length)];
  const element = document.getElementById(`song-${randomSong.id}`);

  if (element) {
    document.querySelectorAll(".song-card.highlighted").forEach((el) => {
      el.classList.remove("highlighted");
    });

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("highlighted");
  }
}

function sort(column) {
  const asc = state.sort.column === column ? !state.sort.asc : true;

  state.sort = { column, asc };

  state.filtered.sort((a, b) => {
    if (column === "number")
      return asc ? a.number - b.number : b.number - a.number;

    return asc
      ? a[column].localeCompare(b[column])
      : b[column].localeCompare(a[column]);
  });

  render();
}

function toggleTheme() {
  const body = document.body;
  body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
}

function openModal(title, bodyHTML, onSave, onDelete = null) {
  const modal = $("#modal");
  const modalTitle = $("#modalTitle");
  const modalBody = $("#modalBody");
  const modalSave = $("#modalSave");
  const modalCancel = $("#modalCancel");
  const modalDelete = $("#modalDelete");

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  modal.classList.remove("hidden");

  if (onDelete) {
    modalDelete.classList.remove("hidden");
    modalDelete.onclick = () => {
      if (confirm("Are you sure you want to delete this song?")) {
        onDelete();
        modal.classList.add("hidden");
      }
    };
  } else {
    modalDelete.classList.add("hidden");
  }

  modalCancel.onclick = () => modal.classList.add("hidden");
  modalSave.onclick = () => {
    onSave();
    modal.classList.add("hidden");
  };
}

function editSong(song) {
  openModal(
    "Edit Song",
    `
    <label>Artist</label>
    <input id="editArtist" value="${song.artist}" />
    <label>Title</label>
    <input id="editTitle" value="${song.title}" />
    <label>Tuning</label>
    <input id="editTuning" value="${song.tuning || ""}" />
    <label>MP3 Filename</label>
    <input id="editMp3" value="${song.mp3 || ""}" />
    `,
    () => {
      song.artist = document.getElementById("editArtist").value;
      song.title = document.getElementById("editTitle").value;
      song.tuning = document.getElementById("editTuning").value;
      song.mp3 = document.getElementById("editMp3").value;

      const custom = loadCustomSongs();
      const index = custom.findIndex((s) => s.id === song.id);
      if (index !== -1) custom[index] = { ...song };
      else custom.push(song);

      saveCustomSongs(custom);
      render();
    },
    () => {
      state.songs = state.songs.filter((s) => s.id !== song.id);

      const custom = loadCustomSongs();
      const updatedCustom = custom.filter((s) => s.id !== song.id);
      saveCustomSongs(updatedCustom);

      render();
    },
  );
}
