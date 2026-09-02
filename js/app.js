const TIER_LABEL = { bronce: "Bronce", plata: "Plata", oro: "Oro", platino: "Platino" };
const TIER_ORDER = ["platino", "oro", "plata", "bronce"];
const TIER_ICON = { bronce: "🥉", plata: "🥈", oro: "🥇", platino: "🏆" };

function countByTier(trofeos) {
  const counts = { bronce: 0, plata: 0, oro: 0, platino: 0 };
  trofeos.forEach((t) => counts[t.tier]++);
  return counts;
}

function renderGamesGrid() {
  const grid = document.getElementById("games-grid");
  if (!grid) return;

  GAMES.forEach((game) => {
    const counts = countByTier(game.trofeos);
    const card = document.createElement("a");
    card.className = "game-card";
    card.href = `juego.html?id=${encodeURIComponent(game.id)}`;
    card.style.setProperty("--game-color", game.color || "#7c5cff");
    card.innerHTML = `
      <div class="banner">🏆</div>
      <div class="body">
        <h3>${game.titulo}</h3>
        <div class="meta">${game.plataformas} · ${game.anio}</div>
        <div class="counts">
          <span class="pill platino"><span class="dot"></span>${counts.platino}</span>
          <span class="pill oro"><span class="dot"></span>${counts.oro}</span>
          <span class="pill plata"><span class="dot"></span>${counts.plata}</span>
          <span class="pill bronce"><span class="dot"></span>${counts.bronce}</span>
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
    </div>
  `;
  container.appendChild(header);

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
        const card = document.createElement("div");
        card.className = "trophy-card";
        card.innerHTML = `
          <div class="trophy-icon ${t.tier}">${TIER_ICON[t.tier]}</div>
          <div class="trophy-info">
            <h4>${t.nombre}</h4>
            <p>${t.desc}</p>
          </div>
          <div class="trophy-tier-label ${t.tier}">${TIER_LABEL[t.tier]}</div>
        `;
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
