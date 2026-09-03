const TIER_LABEL = { bronce: "Bronce", plata: "Plata", oro: "Oro", platino: "Platino" };
const TIER_ORDER = ["platino", "oro", "plata", "bronce"];
const TIER_ICON = { bronce: "🥉", plata: "🥈", oro: "🥇", platino: "🏆" };
const PROGRESS_PREFIX = "trofeos-platino:progress:";

function countByTier(trofeos) {
  const counts = { bronce: 0, plata: 0, oro: 0, platino: 0 };
  trofeos.forEach((t) => counts[t.tier]++);
  return counts;
}

// Progreso del usuario (qué trofeos ya consiguió), guardado solo en su navegador.
// No hay backend: cada dispositivo/navegador lleva su propio progreso.
function getObtained(gameId) {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + gameId);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function saveObtained(gameId, obtainedSet) {
  try {
    localStorage.setItem(PROGRESS_PREFIX + gameId, JSON.stringify([...obtainedSet]));
  } catch (e) {
    // localStorage no disponible (privado/bloqueado): el progreso no persiste, pero la página sigue funcionando.
  }
}

function renderGamesGrid() {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  GAMES.forEach((game) => {
    const counts = countByTier(game.trofeos);
    const obtained = getObtained(game.id);
    const obtainedCount = game.trofeos.filter((t) => obtained.has(t.nombre)).length;
    const pct = Math.round((obtainedCount / game.trofeos.length) * 100);
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = `juego.html?id=${encodeURIComponent(game.id)}`;
    card.style.setProperty("--game-color", game.color || "#7c5cff");
    card.innerHTML = `
      <div class="banner">🏆</div>
      <div class="body">
        <h3>${game.titulo}</h3>
        <div class="meta">${game.plataformas} · ${game.anio}</div>
        <div class="time-badge">⏱ ${game.horasPlatino}h al platino · Dificultad ${game.dificultad}/10</div>
        <div class="counts">
          <span class="pill platino"><span class="dot"></span>${counts.platino}</span>
          <span class="pill oro"><span class="dot"></span>${counts.oro}</span>
          <span class="pill plata"><span class="dot"></span>${counts.plata}</span>
          <span class="pill bronce"><span class="dot"></span>${counts.bronce}</span>
        </div>
        <div class="progress-row">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="progress-label">${obtainedCount}/${game.trofeos.length}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  const placeholder = document.createElement("div");
  placeholder.className = "game-card-empty";
  placeholder.textContent = "Más juegos próximamente…";
  grid.appendChild(placeholder);
}

function renderGamePage() {
  const container = document.getElementById("game-page");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const game = GAMES.find((g) => g.id === id) || GAMES[0];

  if (!game) {
    container.innerHTML = "<p>Juego no encontrado.</p>";
    return;
  }

  document.title = `Trofeos de ${game.titulo} — Trofeos Platino`;
  document.documentElement.style.setProperty("--game-color", game.color || "#7c5cff");

  const counts = countByTier(game.trofeos);
  let obtained = getObtained(game.id);

  const header = document.createElement("div");
  header.innerHTML = `
    <a class="back-link" href="index.html">← Todos los juegos</a>
    <div class="game-hero">
      <div class="badge">🏆</div>
      <div>
        <h1>${game.titulo}</h1>
        <div class="meta">${game.plataformas} · ${game.anio}</div>
      </div>
    </div>
    <p class="game-summary">${game.resumen}</p>
    <div class="stats-row">
      <div class="stat platino"><div class="n">${counts.platino}</div><div class="l">Platino</div></div>
      <div class="stat oro"><div class="n">${counts.oro}</div><div class="l">Oro</div></div>
      <div class="stat plata"><div class="n">${counts.plata}</div><div class="l">Plata</div></div>
      <div class="stat bronce"><div class="n">${counts.bronce}</div><div class="l">Bronce</div></div>
      <div class="stat time"><div class="n">${game.horasPlatino}h</div><div class="l">Al platino</div></div>
      <div class="stat time"><div class="n">${game.dificultad}/10</div><div class="l">Dificultad</div></div>
    </div>
  `;
  container.appendChild(header);

  const progressSection = document.createElement("div");
  progressSection.className = "my-progress";
  progressSection.innerHTML = `
    <div class="my-progress-top">
      <div>
        <h2 class="section-title-big">Mi progreso</h2>
        <p class="section-hint">Marca los trofeos que ya conseguiste. Se guarda solo en este navegador (no hay cuenta ni servidor detrás), así que si cambias de dispositivo o borras los datos del sitio, el progreso no te seguirá.</p>
      </div>
      <button type="button" class="reset-progress-btn">Reiniciar progreso</button>
    </div>
    <div class="progress-row big">
      <div class="progress-bar"><div class="progress-fill" id="my-progress-fill"></div></div>
      <span class="progress-label" id="my-progress-label"></span>
    </div>
  `;
  container.appendChild(progressSection);

  const progressFillEl = progressSection.querySelector("#my-progress-fill");
  const progressLabelEl = progressSection.querySelector("#my-progress-label");

  function updateProgressUI() {
    const obtainedCount = game.trofeos.filter((t) => obtained.has(t.nombre)).length;
    const pct = Math.round((obtainedCount / game.trofeos.length) * 100);
    progressFillEl.style.width = pct + "%";
    progressLabelEl.textContent = `${obtainedCount}/${game.trofeos.length} conseguidos (${pct}%)`;
  }
  updateProgressUI();

  progressSection.querySelector(".reset-progress-btn").addEventListener("click", () => {
    if (!confirm("¿Reiniciar el progreso de este juego? Esto solo afecta a este navegador.")) return;
    obtained = new Set();
    saveObtained(game.id, obtained);
    updateProgressUI();
    list.querySelectorAll(".trophy-card").forEach((card) => {
      card.classList.remove("obtained");
      const cb = card.querySelector(".trophy-checkbox");
      if (cb) cb.checked = false;
    });
  });

  const missable = document.createElement("div");
  missable.className = "missable-section";
  if (game.perdibles && game.perdibles.length > 0) {
    missable.innerHTML = `
      <h2 class="section-title-big">⚠️ Trofeos perdibles</h2>
      <p class="section-hint">Estos trofeos se pueden perder para siempre en una partida si no se atienden a tiempo. Consíguelos antes de seguir la historia.</p>
      <div class="missable-list">
        ${game.perdibles
          .map(
            (m) => `
          <div class="missable-card">
            <div class="missable-icon">⚠️</div>
            <div class="missable-info">
              <h4>${m.nombre}</h4>
              <p>${m.razon}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  } else {
    missable.innerHTML = `
      <h2 class="section-title-big">✅ Trofeos perdibles</h2>
      <p class="section-hint">Este juego no tiene ningún trofeo perdible: todo se puede conseguir después de terminar la historia, sin miedo a arruinar el platino.</p>
    `;
  }
  container.appendChild(missable);

  const filters = document.createElement("div");
  filters.className = "filters";
  const tiersPresent = TIER_ORDER.filter((t) => counts[t] > 0);
  filters.innerHTML =
    `<button class="filter-btn active" data-tier="todos"><span class="dot"></span>Todos (${game.trofeos.length})</button>` +
    tiersPresent
      .map(
        (t) =>
          `<button class="filter-btn" data-tier="${t}"><span class="dot"></span>${TIER_LABEL[t]} (${counts[t]})</button>`
      )
      .join("");
  container.appendChild(filters);

  const list = document.createElement("div");
  list.className = "trophy-list";
  container.appendChild(list);

  function renderList(filterTier) {
    list.innerHTML = "";
    game.trofeos
      .filter((t) => filterTier === "todos" || t.tier === filterTier)
      .forEach((t) => {
        const isObtained = obtained.has(t.nombre);
        const card = document.createElement("div");
        card.className = "trophy-card" + (isObtained ? " obtained" : "");
        card.innerHTML = `
          <label class="trophy-check-wrap">
            <input type="checkbox" class="trophy-checkbox" ${isObtained ? "checked" : ""} aria-label="Marcar ${t.nombre} como conseguido" />
          </label>
          <div class="trophy-icon ${t.tier}">${TIER_ICON[t.tier]}</div>
          <div class="trophy-info">
            <h4>${t.nombre}</h4>
            <p>${t.desc}</p>
          </div>
          <div class="trophy-tier-label ${t.tier}">${TIER_LABEL[t.tier]}</div>
        `;
        card.querySelector(".trophy-checkbox").addEventListener("change", (e) => {
          if (e.target.checked) {
            obtained.add(t.nombre);
          } else {
            obtained.delete(t.nombre);
          }
          saveObtained(game.id, obtained);
          card.classList.toggle("obtained", e.target.checked);
          updateProgressUI();
        });
        list.appendChild(card);
      });
  }

  renderList("todos");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderList(btn.dataset.tier);
  });
}

renderGamesGrid();
renderGamePage();
