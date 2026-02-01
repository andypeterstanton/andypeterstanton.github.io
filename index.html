<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Tab</title>
  <link rel="icon" type="image/png" href="Icon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    :root {
      --bg: #0f1115;
      --card: #161a22;
      --text: #eaeaf0;
      --muted: #9aa0a6;
      --accent: #8ab4f8;
      --border: #232938;
      --radius: 18px;
    }

    * {
      box-sizing: border-box;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      margin: 0;
      height: 100vh;
      color: var(--text);
      display: flex;
      flex-direction: column;

      background: linear-gradient(120deg, #0f1115, #151a25, #0f1115);
      background-size: 400% 400%;
      animation: gradientMove 20s ease infinite;
    }

    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* Top right links */
    .top-links {
      display: flex;
      justify-content: flex-end;
      padding: 20px 28px;
      gap: 18px;
      font-size: 14px;
    }

    .top-links a {
      color: var(--muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .top-links a:hover {
      color: var(--text);
    }

    /* Center container */
    .center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 32px;
    }

    /* Clock */
    .clock {
      font-size: 48px;
      font-weight: 500;
      letter-spacing: -1px;
      text-align: center;
    }

    .clock span {
      display: block;
      font-size: 15px;
      color: var(--muted);
      margin-top: 6px;
    }

    /* Search box */
    .search-box {
      width: min(680px, 90%);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      padding: 14px 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .search-box:focus-within {
      border-color: var(--accent);
      box-shadow:
        0 0 0 1px var(--accent),
        0 25px 60px rgba(0,0,0,0.6);
    }

    .search-box input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text);
      font-size: 18px;
    }

    .search-box input::placeholder {
      color: var(--muted);
    }

    /* Autocomplete (FIXED positioning) */
    .autocomplete {
      position: absolute;
      top: 100%;
      margin-top: 10px;
      width: min(680px, 90%);
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,0.6);
      z-index: 20;
    }

    .autocomplete div {
      padding: 14px 20px;
      cursor: pointer;
      font-size: 16px;
    }

    .autocomplete div:hover,
    .autocomplete .active {
      background: rgba(138, 180, 248, 0.15);
    }

    .hint {
      font-size: 13px;
      color: var(--muted);
    }
  </style>
</head>

<body>
  <div class="top-links">
    <a href="https://mail.google.com">Gmail</a>
    <a href="https://calendar.google.com">Calendar</a>
    <a href="https://drive.google.com">Drive</a>
    <a href="https://www.youtube.com">YouTube</a>
  </div>

  <div class="center">
    <div id="clock" class="clock"></div>

    <div style="position: relative; width: 100%; display: flex; justify-content: center;">
      <form class="search-box"
            action="https://www.google.com/search"
            method="GET"
            autocomplete="off">
        <input
          id="searchInput"
          type="text"
          name="q"
          autofocus
          placeholder="Search Google…"
        />
      </form>

      <div id="autocomplete" class="autocomplete" hidden></div>
    </div>

    <div class="hint">Press Enter to search</div>
  </div>

  <script>
    /* Clock */
    function updateClock() {
      const now = new Date();
      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      const date = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric"
      });

      document.getElementById("clock").innerHTML =
        `${time}<span>${date}</span>`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    /* Autocomplete */
    const input = document.getElementById("searchInput");
    const box = document.getElementById("autocomplete");
    let activeIndex = -1;

    window.googleCallback = function (data) {
      const suggestions = data[1].slice(0, 8);
      box.innerHTML = "";
      activeIndex = -1;

      suggestions.forEach(text => {
        const div = document.createElement("div");
        div.textContent = text;
        div.onclick = () => {
          input.value = text;
          input.form.submit();
        };
        box.appendChild(div);
      });

      box.hidden = suggestions.length === 0;
    };

    input.addEventListener("input", () => {
      const query = input.value.trim();
      if (!query) {
        box.hidden = true;
        return;
      }

      const old = document.getElementById("jsonp");
      if (old) old.remove();

      const script = document.createElement("script");
      script.id = "jsonp";
      script.src =
        "https://suggestqueries.google.com/complete/search" +
        "?client=firefox&q=" + encodeURIComponent(query) +
        "&callback=googleCallback";

      document.body.appendChild(script);
    });

    input.addEventListener("keydown", e => {
      const items = box.querySelectorAll("div");
      if (!items.length) return;

      if (e.key === "ArrowDown") activeIndex = (activeIndex + 1) % items.length;
      if (e.key === "ArrowUp") activeIndex = (activeIndex - 1 + items.length) % items.length;

      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        input.value = items[activeIndex].textContent;
        input.form.submit();
      }

      items.forEach(el => el.classList.remove("active"));
      if (items[activeIndex]) items[activeIndex].classList.add("active");
    });

    document.addEventListener("click", e => {
      if (!box.contains(e.target) && e.target !== input) {
        box.hidden = true;
      }
    });
  </script>
</body>
</html>
