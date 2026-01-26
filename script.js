// script.js

// SISTEMA DE STEPS
const app = document.getElementById("app");
const track = document.getElementById("track");
const totalSteps = track.children.length;
track.style.width = `${totalSteps * 100}vw`;

let state = {
  step: 0,
  teams: 0,
  teamsNames: [],
  mode: "tournament", // "tournament" | "league"
};

function go(step) {
  const last = totalSteps - 1;
  state.step = Math.max(0, Math.min(step, last));
  track.style.transform = `translateX(-${state.step * app.clientWidth}px)`;
}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-back-step]");
  if (btn) go(Number(btn.dataset.backStep));
});

// ======= Helpers UI (MUY IMPORTANTE) =======
function setBtnEnabled(btn, enabled) {
  // Estado real
  btn.disabled = !enabled;

  // Estado visual forzado (no dependemos de disabled: de Tailwind)
  if (!enabled) {
    btn.classList.add("opacity-40", "cursor-not-allowed");
    btn.classList.remove("hover:bg-emerald-700", "hover:bg-blue-700", "hover:bg-slate-700", "hover:bg-purple-700");
  } else {
    btn.classList.remove("opacity-40", "cursor-not-allowed");
    // (No hace falta volver a añadir los hover, porque ya vienen en className del HTML)
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ======= PÀGINA 1 =======
const teamsCount = document.getElementById("teamsCount");
const toStep2 = document.getElementById("toStep2");

toStep2.addEventListener("click", () => {
  if (Number(teamsCount.value) < 2) return;
  state.teams = Number(teamsCount.value);
  go(1);
  updateTable();
});

// ======= PÀGINA 2 =======
const teamsRows = document.getElementById("teams-rows");
const modeSelect = document.getElementById("modeSelect");
const generateBtn = document.getElementById("generateBtn");
const step2Error = document.getElementById("step2Error");

function updateTable() {
  teamsRows.innerHTML = "";
  for (let i = 0; i < state.teams; i++) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = `Equip ${i + 1}`;
    th.className = "px-2 py-2 text-slate-200";

    const td = document.createElement("td");
    td.className = "py-2";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Equip ${i + 1}`;
    input.className =
      "w-full px-3 py-2 rounded bg-black text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600";

    td.appendChild(input);
    tr.appendChild(th);
    tr.appendChild(td);
    teamsRows.appendChild(tr);
  }
}

function showError(msg) {
  step2Error.textContent = msg;
  step2Error.classList.remove("hidden");
}
function hideError() {
  step2Error.textContent = "";
  step2Error.classList.add("hidden");
}

// ======= PÀGINA 3 =======
const contentDiv = document.getElementById("content");
const page3Title = document.getElementById("page3Title");
const page3Subtitle = document.getElementById("page3Subtitle");

// Controls torneig
const tournamentControls = document.getElementById("tournamentControls");
const playRoundBtn = document.getElementById("playRoundBtn");
const nextPhaseBtn = document.getElementById("nextPhaseBtn");
const roundInfo = document.getElementById("roundInfo");

// Controls lliga
const leagueControls = document.getElementById("leagueControls");
const simulateMatchdayBtn = document.getElementById("simulateMatchdayBtn");
const nextMatchdayBtn = document.getElementById("nextMatchdayBtn");
const simulateAllLeagueBtn = document.getElementById("simulateAllLeagueBtn");
const finishLeagueBtn = document.getElementById("finishLeagueBtn");
const leagueInfo = document.getElementById("leagueInfo");
const standingsWrap = document.getElementById("standingsWrap");

// Final + reiniciar
const winnerDiv = document.getElementById("winner");
const restartBtn = document.getElementById("restartBtn");

// -------- GENERAR --------
generateBtn.addEventListener("click", () => {
  hideError();

  const inputs = teamsRows.querySelectorAll("input");
  const names = Array.from(inputs).map((i, idx) => i.value.trim() || `Equip ${idx + 1}`);

  if (names.length !== state.teams) {
    showError("Hi ha un error amb el nombre d'equips.");
    return;
  }

  state.teamsNames = names;
  state.mode = modeSelect.value;

  contentDiv.innerHTML = "";
  winnerDiv.textContent = "";

  if (state.mode === "league") renderLeague();
  else initTournament();

  go(2);
});

// =======================
//        TORNEIG
// =======================
let t_currentTeams = [];
let t_round = 1;
let t_matches = [];
let t_lastWinners = null;
let t_simulated = false;

function initTournament() {
  page3Title.textContent = "Torneig: eliminatòries";
  page3Subtitle.textContent =
    "Simula la ronda, observa els resultats i després passa a la següent fase amb el botó.";

  tournamentControls.classList.remove("hidden");
  leagueControls.classList.add("hidden");
  standingsWrap.classList.add("hidden");

  t_currentTeams = [...state.teamsNames];
  shuffle(t_currentTeams);
  t_round = 1;

  t_lastWinners = null;
  t_simulated = false;

  setBtnEnabled(nextPhaseBtn, false);
  setBtnEnabled(playRoundBtn, true);

  renderTournamentRound();
}

function renderTournamentRound() {
  contentDiv.innerHTML = "";
  roundInfo.textContent = `Ronda ${t_round} · ${t_currentTeams.length} equips`;

  const title = document.createElement("div");
  title.className = "font-bold text-lg border-b border-slate-600 pb-2";
  title.textContent = `Ronda ${t_round}`;
  contentDiv.appendChild(title);

  t_matches = [];
  for (let i = 0; i < t_currentTeams.length; i += 2) {
    const a = t_currentTeams[i];
    const b = t_currentTeams[i + 1];
    t_matches.push({ a, b, winner: null });
  }

  t_matches.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "bg-slate-800 p-4 rounded border border-slate-700";

    const label = document.createElement("div");
    label.className = "text-xs text-slate-400 mb-3";
    label.textContent = `Partit ${idx + 1}`;

    const vsRow = document.createElement("div");
    vsRow.className = "grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center";

    const left = document.createElement("div");
    left.className = "px-3 py-3 rounded bg-black/40 border border-slate-700 font-bold text-center text-base";
    left.textContent = m.a;

    const vs = document.createElement("div");
    vs.className = "text-center font-extrabold text-slate-300 text-lg";
    vs.textContent = "VS";

    const right = document.createElement("div");
    right.className = "px-3 py-3 rounded bg-black/40 border border-slate-700 font-bold text-center text-base";
    right.textContent = m.b;

    card.dataset.realA = m.a;
    card.dataset.realB = m.b;
    card.dataset.index = String(idx);

    vsRow.appendChild(left);
    vsRow.appendChild(vs);
    vsRow.appendChild(right);

    const result = document.createElement("div");
    result.className = "mt-3 text-sm text-slate-300";
    result.innerHTML = `<span class="text-slate-400">Resultat:</span> <span class="italic">pendent de simular</span>`;
    result.dataset.role = "result";

    card.appendChild(label);
    card.appendChild(vsRow);
    card.appendChild(result);

    contentDiv.appendChild(card);
  });

  t_simulated = false;
  t_lastWinners = null;
  setBtnEnabled(nextPhaseBtn, false);
  setBtnEnabled(playRoundBtn, true);
}

playRoundBtn.addEventListener("click", () => {
  if (!t_matches.length || t_simulated) return;

  const winners = [];
  const cards = Array.from(contentDiv.querySelectorAll("[data-index]"));

  cards.forEach(card => {
    const a = card.dataset.realA;
    const b = card.dataset.realB;

    const winner = Math.random() < 0.5 ? a : b;
    winners.push(winner);

    const result = card.querySelector('[data-role="result"]');
    result.className = "mt-3 text-sm font-semibold text-green-400";
    result.textContent = `Guanya: ${winner}`;
  });

  t_lastWinners = winners;
  t_simulated = true;

  setBtnEnabled(nextPhaseBtn, true);
  setBtnEnabled(playRoundBtn, false);
});

nextPhaseBtn.addEventListener("click", () => {
  if (!t_simulated || !t_lastWinners) return;

  if (t_lastWinners.length === 1) {
    winnerDiv.textContent = `Campeó del torneig: ${t_lastWinners[0]}`;
    go(3);
    return;
  }

  t_currentTeams = [...t_lastWinners];
  t_round += 1;
  renderTournamentRound();
});

// =======================
//         LLIGA
// =======================
let league = {
  rounds: [],
  currentRoundIdx: 0,
  table: {},
};

function initLeagueTable(teams) {
  const t = {};
  teams.forEach(name => {
    t[name] = { team: name, PJ: 0, PG: 0, PE: 0, PP: 0, GF: 0, GC: 0, DG: 0, PTS: 0 };
  });
  return t;
}

function generateSingleRoundRobin(teams) {
  const n = teams.length;
  const list = [...teams];
  const rounds = [];

  for (let r = 0; r < n - 1; r++) {
    const matches = [];
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      matches.push({ home, away, homeGoals: null, awayGoals: null });
    }
    rounds.push(matches);

    const fixed = list[0];
    const rest = list.slice(1);
    rest.unshift(rest.pop());
    list.splice(0, list.length, fixed, ...rest);
  }
  return rounds;
}

function buildLeagueRounds(teams) {
  const firstLeg = generateSingleRoundRobin(teams);
  const secondLeg = firstLeg.map(round =>
    round.map(m => ({ home: m.away, away: m.home, homeGoals: null, awayGoals: null }))
  );

  const rounds = [];
  firstLeg.forEach((matches, i) => rounds.push({ name: `Anada J${i + 1}`, matches }));
  secondLeg.forEach((matches, i) => rounds.push({ name: `Tornada J${i + 1}`, matches }));
  return rounds;
}

function goalsRandom() {
  return Math.floor(Math.random() * 6);
}

function applyMatchResultToTable(match) {
  const { home, away, homeGoals, awayGoals } = match;
  const H = league.table[home];
  const A = league.table[away];

  H.PJ += 1; A.PJ += 1;
  H.GF += homeGoals; H.GC += awayGoals;
  A.GF += awayGoals; A.GC += homeGoals;

  if (homeGoals > awayGoals) {
    H.PG += 1; A.PP += 1; H.PTS += 3;
  } else if (homeGoals < awayGoals) {
    A.PG += 1; H.PP += 1; A.PTS += 3;
  } else {
    H.PE += 1; A.PE += 1; H.PTS += 1; A.PTS += 1;
  }

  H.DG = H.GF - H.GC;
  A.DG = A.GF - A.GC;
}

function roundIsSimulated(roundObj) {
  return roundObj.matches.every(m => m.homeGoals !== null && m.awayGoals !== null);
}

function leagueFinished() {
  return league.rounds.length > 0 && league.rounds.every(r => roundIsSimulated(r));
}

// ✅ Estado coherente SIEMPRE desde una sola función
function updateLeagueControls() {
  const hasLeague = league.rounds && league.rounds.length > 0;

  if (!hasLeague) {
    setBtnEnabled(simulateMatchdayBtn, false);
    setBtnEnabled(nextMatchdayBtn, false);
    setBtnEnabled(simulateAllLeagueBtn, false);
    setBtnEnabled(finishLeagueBtn, false);
    return;
  }

  const total = league.rounds.length;
  const idx = league.currentRoundIdx;
  const current = league.rounds[idx];

  const currentSimulated = roundIsSimulated(current);
  const isLast = idx >= total - 1;
  const finished = leagueFinished();

  // Regla clara:
  // - Simular jornada: solo si NO simulada y NO finalizada
  setBtnEnabled(simulateMatchdayBtn, !finished && !currentSimulated);

  // - Següent jornada: solo si la actual está simulada, no es la última y no está finalizada
  setBtnEnabled(nextMatchdayBtn, !finished && currentSimulated && !isLast);

  // - Simular tota la lliga: solo si NO finalizada
  setBtnEnabled(simulateAllLeagueBtn, !finished);

  // - Finalitzar lliga: solo si finalizada
  setBtnEnabled(finishLeagueBtn, finished);
}

function renderLeague() {
  page3Title.textContent = "Lliga: calendari i simulació";
  page3Subtitle.textContent = "Simula jornades (resultats aleatoris) i mira la classificació en temps real.";

  tournamentControls.classList.add("hidden");
  leagueControls.classList.remove("hidden");
  standingsWrap.classList.remove("hidden");

  const teams = [...state.teamsNames];
  shuffle(teams);

  league.rounds = buildLeagueRounds(teams);
  league.currentRoundIdx = 0;
  league.table = initLeagueTable(teams);

  renderStandings();
  renderLeagueCurrentRound();

  // IMPORTANTÍSIMO: forzar estado coherente al entrar
  updateLeagueControls();
}

function renderLeagueCurrentRound() {
  contentDiv.innerHTML = "";

  const roundObj = league.rounds[league.currentRoundIdx];
  leagueInfo.textContent = `Jornada ${league.currentRoundIdx + 1}/${league.rounds.length} · ${roundObj.name}`;

  const header = document.createElement("div");
  header.className = "font-bold text-lg border-b border-slate-600 pb-2";
  header.textContent = `Jornada ${league.currentRoundIdx + 1} — ${roundObj.name}`;
  contentDiv.appendChild(header);

  roundObj.matches.forEach((m, idx) => {
    const card = document.createElement("div");
    card.className = "bg-slate-800 p-4 rounded border border-slate-700";

    const label = document.createElement("div");
    label.className = "text-xs text-slate-400 mb-3";
    label.textContent = `Partit ${idx + 1}`;

    const row = document.createElement("div");
    row.className = "grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center";

    const left = document.createElement("div");
    left.className = "px-3 py-3 rounded bg-black/40 border border-slate-700 font-bold text-center";
    left.textContent = m.home;

    const mid = document.createElement("div");
    mid.className = "text-center font-extrabold text-slate-200 text-lg";
    mid.textContent = (m.homeGoals === null) ? "VS" : `${m.homeGoals} - ${m.awayGoals}`;

    const right = document.createElement("div");
    right.className = "px-3 py-3 rounded bg-black/40 border border-slate-700 font-bold text-center";
    right.textContent = m.away;

    row.appendChild(left);
    row.appendChild(mid);
    row.appendChild(right);

    const status = document.createElement("div");
    status.className = "mt-3 text-sm text-slate-300";
    status.innerHTML = (m.homeGoals === null)
      ? `<span class="text-slate-400">Resultat:</span> <span class="italic">pendent de simular</span>`
      : `<span class="text-slate-400">Resultat:</span> <span class="font-semibold text-green-400">${m.homeGoals} - ${m.awayGoals}</span>`;

    card.appendChild(label);
    card.appendChild(row);
    card.appendChild(status);

    contentDiv.appendChild(card);
  });

  // ✅ Siempre recalcular después de render
  updateLeagueControls();
}

simulateMatchdayBtn.addEventListener("click", () => {
  if (!league.rounds.length) return;

  const roundObj = league.rounds[league.currentRoundIdx];
  if (roundIsSimulated(roundObj)) {
    updateLeagueControls();
    return;
  }

  roundObj.matches.forEach(m => {
    m.homeGoals = goalsRandom();
    m.awayGoals = goalsRandom();
    applyMatchResultToTable(m);
  });

  renderStandings();
  renderLeagueCurrentRound(); // ya llama updateLeagueControls()
});

nextMatchdayBtn.addEventListener("click", () => {
  if (!league.rounds.length) return;

  const roundObj = league.rounds[league.currentRoundIdx];
  if (!roundIsSimulated(roundObj)) {
    updateLeagueControls();
    return;
  }

  if (league.currentRoundIdx < league.rounds.length - 1) {
    league.currentRoundIdx += 1;
    renderLeagueCurrentRound(); // ya llama updateLeagueControls()
  } else {
    updateLeagueControls();
  }
});

simulateAllLeagueBtn.addEventListener("click", () => {
  if (!league.rounds.length) return;

  for (let i = league.currentRoundIdx; i < league.rounds.length; i++) {
    const r = league.rounds[i];
    if (roundIsSimulated(r)) continue;

    r.matches.forEach(m => {
      m.homeGoals = goalsRandom();
      m.awayGoals = goalsRandom();
      applyMatchResultToTable(m);
    });
  }

  league.currentRoundIdx = league.rounds.length - 1;
  renderStandings();
  renderLeagueCurrentRound(); // ya llama updateLeagueControls()
});

finishLeagueBtn.addEventListener("click", () => {
  if (!leagueFinished()) {
    updateLeagueControls();
    return;
  }

  const sorted = getStandingsSorted();
  const champion = sorted[0]?.team ?? "—";
  winnerDiv.textContent = `Campió de la lliga: ${champion}`;
  go(3);
});

function getStandingsSorted() {
  const rows = Object.values(league.table);
  rows.sort((a, b) => {
    if (b.PTS !== a.PTS) return b.PTS - a.PTS;
    if (b.DG !== a.DG) return b.DG - a.DG;
    if (b.GF !== a.GF) return b.GF - a.GF;
    return a.team.localeCompare(b.team);
  });
  return rows;
}

function renderStandings() {
  const rows = getStandingsSorted();

  const wrap = document.createElement("div");
  wrap.className = "bg-slate-900/40 border border-slate-700 rounded-lg p-4";

  const h = document.createElement("div");
  h.className = "font-bold text-lg mb-3";
  h.textContent = "Classificació";

  const table = document.createElement("table");
  table.className = "w-full text-left border-collapse text-sm";

  table.innerHTML = `
    <thead>
      <tr class="text-slate-300">
        <th class="py-2 pr-2 border-b border-slate-700 w-10">#</th>
        <th class="py-2 px-2 border-b border-slate-700">Equip</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">PJ</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">PG</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">PE</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">PP</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">GF</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">GC</th>
        <th class="py-2 px-2 border-b border-slate-700 text-right">DG</th>
        <th class="py-2 pl-2 border-b border-slate-700 text-right font-bold">PTS</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  rows.forEach((r, idx) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-800/40";
    tr.innerHTML = `
      <td class="py-2 pr-2 border-b border-slate-800 text-slate-300">${idx + 1}</td>
      <td class="py-2 px-2 border-b border-slate-800 font-semibold">${escapeHtml(r.team)}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.PJ}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.PG}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.PE}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.PP}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.GF}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.GC}</td>
      <td class="py-2 px-2 border-b border-slate-800 text-right">${r.DG}</td>
      <td class="py-2 pl-2 border-b border-slate-800 text-right font-bold">${r.PTS}</td>
    `;
    tbody.appendChild(tr);
  });

  wrap.appendChild(h);
  wrap.appendChild(table);

  standingsWrap.innerHTML = "";
  standingsWrap.appendChild(wrap);
}

// =======================
//        Reiniciar
// =======================
function resetAll() {
  state.step = 0;
  state.teams = 0;
  state.teamsNames = [];
  state.mode = "tournament";

  teamsCount.value = "-1";
  modeSelect.value = "tournament";
  teamsRows.innerHTML = "";
  contentDiv.innerHTML = "";
  winnerDiv.textContent = "";
  hideError();

  // reset torneig
  t_currentTeams = [];
  t_round = 1;
  t_matches = [];
  t_lastWinners = null;
  t_simulated = false;

  // reset lliga
  league = { rounds: [], currentRoundIdx: 0, table: {} };

  tournamentControls.classList.add("hidden");
  leagueControls.classList.add("hidden");
  standingsWrap.classList.add("hidden");

  setBtnEnabled(nextPhaseBtn, false);
  setBtnEnabled(playRoundBtn, true);

  updateLeagueControls();

  go(0);
}

restartBtn.addEventListener("click", resetAll);
window.addEventListener("resize", () => go(state.step));
