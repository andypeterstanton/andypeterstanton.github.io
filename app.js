const state = {
  songs: [],
  filtered: [],
  sort: { column: null, asc: true },
  favouritesOnly: false,
  recentPlayed: [],
};

const $ = (s) => document.querySelector(s);
let songContainer;
const audio = $("#audio");
const nowPlaying = $("#nowPlaying");
let highlightedSongId = null;
let isScrubbing = false;
let wasPlayingBeforeScrub = false;

/* -------- ID GENERATOR ------------ */
function generateId(song) {
  return (
    song.artist.trim().toLowerCase().replace(/\s+/g, "_") +
    "__" +
    song.title.trim().toLowerCase().replace(/\s+/g, "_")
  );
}

async function saveSongsToServer() {
  const res = await fetch("/api/songs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state.songs),
  });

  if (!res.ok) {
    console.error("Failed to save songs");
  }
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
  const res = await fetch("/api/songs");
  const baseSongs = await res.json();

  const combined = baseSongs;

  state.songs = combined.map((s, index) => {
    const id = s.id || generateId(s);

    return {
      id,
      number: s.number ?? index + 1,
      favourite: s.favourite ?? false,
      artist: s.artist,
      title: s.title,
      tuning: s.tuning,
      mp3: s.mp3 || "",
    };
  });

  state.filtered = [...state.songs];
}

/* ---------------- RENDER ---------------- */
function render() {

  state.songs.sort((a, b) => a.number - b.number);

  songContainer.innerHTML = "";
  const term = $("#search").value.toLowerCase();

  state.filtered = state.songs.filter((s) => {
    if (state.favouritesOnly && !s.favourite) return false;
    return `${s.artist} ${s.title} ${s.tuning}`.toLowerCase().includes(term);
  });

  const frag = document.createDocumentFragment();

  state.filtered.forEach((song) => {
    const card = document.createElement("div");
    const isPlaying = currentSongId === song.id;
    const isHighlighted = highlightedSongId === song.id;

    const isRecent = state.recentPlayed.includes(song.id);

    card.className = `
  song-card
  ${isPlaying ? "playing" : ""}
  ${isHighlighted ? "highlighted" : ""}
  ${isRecent ? "recent" : ""}
`;
    card.id = `song-${song.id}`;

    card.innerHTML = `
      <svg class="progress-ring" viewBox="0 0 420 100" preserveAspectRatio="none">
        <rect class="progress-rect" x="2" y="2" width="416" height="96" rx="18" pathLength="100" />
      </svg>

      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
        <div class="song-meta">#${song.number} • ${song.tuning || "Standard"}</div>
      </div>

      <div class="song-actions">
        <button data-play="${song.id}" class="${isPlaying && !audio.paused ? "active-icon" : ""}">
          ${isPlaying && !audio.paused ? "⏸" : "▶"}
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
  songContainer.querySelectorAll(".song-card").forEach((card) => {
    const id = card.id.replace("song-", "");
    enableRingScrubbing(card, id);
  });
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
          async () => {
            const artist = document.getElementById("newArtist").value.trim();
            const title = document.getElementById("newTitle").value.trim();
            const tuning = document.getElementById("newTuning").value.trim();
            const mp3 = document.getElementById("newMp3").value.trim();

            if (!artist || !title) {
              alert("Artist and Title are required");
              return;
            }

            const newSong = { artist, title, tuning, mp3 };

            newSong.id = generateId(newSong);

            state.songs.forEach((song) => {
              song.number += 1;
            });

            const songToAdd = {
              ...newSong,
              number: 1,
              favourite: false,
            };

            state.songs.unshift(songToAdd);

            await saveSongsToServer();
            await loadSongs();

            render();
          },
        );
      }

      if (action === "bulkAdd") {
        openModal(
          "Bulk Add Songs",
          `
    <p style="font-size:0.9rem;color:var(--muted);margin-bottom:10px">
      Paste songs in the format:<br>
      <b>Artist | Title | Tuning | MP3</b>
    </p>

    <textarea id="bulkInput" rows="10" placeholder="Madonna | Sorry | E Standard
Pet Shop Boys | Its A Sin | 5 String
A-ha | Take On Me | E Standard"></textarea>

    <p style="font-size:0.8rem;color:var(--muted);margin-top:10px">
      MP3 is optional.
    </p>
    `,
          async () => {
            const lines = document
              .getElementById("bulkInput")
              .value.split("\n")
              .map((l) => l.trim())
              .filter((l) => l.length > 0);

            if (lines.length === 0) {
              alert("No songs detected");
              return;
            }

            const newSongs = [];

            lines.forEach((line) => {
              const parts = line.split("|").map((p) => p.trim());

              if (parts.length < 2) return;

              const artist = parts[0];
              const title = parts[1];
              const tuning = parts[2] || "";
              const mp3 = parts[3] || "";

              const song = {
                artist,
                title,
                tuning,
                mp3,
              };

              song.id = generateId(song);

              newSongs.push({
                ...song,
                number: state.songs.length + newSongs.length + 1,
                favourite: false,
              });
            });

            if (newSongs.length === 0) {
              alert("No valid songs found");
              return;
            }

            state.songs.push(...newSongs);

            await saveSongsToServer();
            await loadSongs();

            render();
          },
        );
      }
    });
  }

  const extInput = document.getElementById("externalSearch");
const gBtn = document.getElementById("searchGoogle");
const ugBtn = document.getElementById("searchUG");

if (gBtn && ugBtn && extInput) {
  gBtn.onclick = () => {
    const q = encodeURIComponent(extInput.value.trim());
    if (!q) return;
    window.open(`https://www.google.com/search?q=${q}`, "_blank");
  };

  ugBtn.onclick = () => {
    const q = encodeURIComponent(extInput.value.trim());
    if (!q) return;
    window.open(
      `https://www.ultimate-guitar.com/search.php?search_type=title&value=${q}`,
      "_blank"
    );
  };
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
        saveSongsToServer();
        render();
      }
    });
  }
}

/* ---------------- ACTIONS ---------------- */
let currentSongId = null;

function playSong(song) {
  highlightedSongId = null;

  state.recentPlayed = state.recentPlayed.filter(id => id !== song.id);
  state.recentPlayed.unshift(song.id);

  if (state.recentPlayed.length > 20) {
    state.recentPlayed.pop();
  }

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

  highlightedSongId = randomSong.id;

  render();

  requestAnimationFrame(() => {
    const element = document.getElementById(`song-${randomSong.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
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
  modalSave.onclick = async () => {
    await onSave();
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

<div style="margin-top:10px">
  <button id="findSongBtn">Find Song</button>
  <input type="file" id="filePicker" accept=".mp3" style="display:none">
</div>
    `,
    () => {
      song.artist = document.getElementById("editArtist").value;
      song.title = document.getElementById("editTitle").value;
      song.tuning = document.getElementById("editTuning").value;
      song.mp3 = document.getElementById("editMp3").value;

      saveSongsToServer();
      render();
    },
    () => {
      state.songs = state.songs.filter((s) => s.id !== song.id);

      saveSongsToServer();
      render();
    },
  );
  setTimeout(() => {
    const findBtn = document.getElementById("findSongBtn");
    const picker = document.getElementById("filePicker");

    if (!findBtn || !picker) return;

    findBtn.onclick = () => picker.click();

    picker.onchange = async () => {
      const file = picker.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload/${song.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      song.mp3 = data.filename;

      document.getElementById("editMp3").value = data.filename;

      await saveSongsToServer();
    };
  }, 100);
}

function getPerimeterProgress(event, element) {
  const rect = element.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const w = rect.width;
  const h = rect.height;

  const perimeter = 2 * (w + h);

  let distance = 0;

  const edgeTolerance = 20;

  // Top edge
  if (y < edgeTolerance) {
    distance = x;
  }

  // Right edge
  else if (x > w - edgeTolerance) {
    distance = w + y;
  }

  // Bottom edge
  else if (y > h - edgeTolerance) {
    distance = w + h + (w - x);
  }

  // Left edge
  else if (x < edgeTolerance) {
    distance = w + h + w + (h - y);
  } else {
    return null;
  }

  return distance / perimeter;
}

function enableRingScrubbing(card, songId) {
  const ring = card.querySelector(".progress-ring");
  if (!ring) return;

  function update(event) {
    if (songId !== currentSongId) return;

    const progress = getPerimeterProgress(event, ring);
    if (progress === null) return;

    if (!audio.duration) return;

    audio.currentTime = progress * audio.duration;
  }

  ring.addEventListener("mousedown", (e) => {
    if (songId !== currentSongId) return;

    wasPlayingBeforeScrub = !audio.paused;
    audio.pause();

    isScrubbing = true;
    update(e);
  });

  window.addEventListener("mousemove", (e) => {
    if (!isScrubbing) return;
    update(e);
  });

  window.addEventListener("mouseup", () => {
    if (!isScrubbing) return;

    isScrubbing = false;

    if (wasPlayingBeforeScrub) {
      audio.play();
    }
  });
}

function animateProgress() {
  if (currentSongId && !isScrubbing && audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    const activeCard = document.getElementById(`song-${currentSongId}`);

    if (activeCard) {
      const rect = activeCard.querySelector(".progress-rect");
      if (rect) {
        rect.style.strokeDashoffset = 100 - progress;
      }
    }
  }

  requestAnimationFrame(animateProgress);
}

animateProgress();

const searchWrapper = document.getElementById("searchWrapper");
const sidebarSlot = document.getElementById("sidebarSearchSlot");
const topbar = document.querySelector(".topbar");

let inSidebar = false;

window.addEventListener("scroll", () => {
  const shouldMove = window.scrollY > 100;

  const searchInput = document.getElementById("search");
  const wasFocused = document.activeElement === searchInput;
  const start = searchInput.selectionStart;
  const end = searchInput.selectionEnd;

  if (shouldMove && !inSidebar) {
    sidebarSlot.appendChild(searchWrapper);
    inSidebar = true;
  }

  if (!shouldMove && inSidebar) {
    topbar.appendChild(searchWrapper);
    inSidebar = false;
  }

  if (wasFocused) {
  searchInput.focus();
  searchInput.setSelectionRange(start, end);
  }

  // 🔥 restore focus AFTER moving
  if (wasFocused) {
    searchInput.focus();
  }
});
