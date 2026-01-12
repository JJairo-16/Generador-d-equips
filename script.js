// #region Sistema d'steps
(() => {
  const app = document.getElementById("app");
  const track = document.getElementById("track");

  const teamsCount = document.getElementById("teamsCount");
  const teamsPreview = document.getElementById("teamsPreview");
  const teamsFinal = document.getElementById("teamsFinal");

  const toStep2 = document.getElementById("toStep2");
  const toStep3 = document.getElementById("toStep3");
  const backToStep1 = document.getElementById("backToStep1");
  const backToStep2 = document.getElementById("backToStep2");
  const finish = document.getElementById("finish");

  const state = {
    step: 0, // 0..2
    teams: teamsCount.value,
  };

  function updateTrackPosition(pushHistory = true) {
    const pageWidth = app.clientWidth; // amplada real visible
    const x = -(state.step * pageWidth);

    track.style.transform = `translateX(${x}px)`;

    // textos
    teamsPreview.textContent = state.teams;
    teamsFinal.textContent = state.teams;

    // hash + history
    if (pushHistory) {
      const hash = `#step-${state.step + 1}`;
      if (location.hash !== hash) history.pushState({ step: state.step }, "", hash);
    }
  }

  function go(step, pushHistory = true) {
    state.step = Math.max(0, Math.min(step, 2));
    updateTrackPosition(pushHistory);
  }

  // Btn
  toStep2.addEventListener("click", () => {
    state.teams = teamsCount.value;
    go(1);
  });

  toStep3.addEventListener("click", () => go(2));
  backToStep1.addEventListener("click", () => go(0));
  backToStep2.addEventListener("click", () => go(1));

  finish.addEventListener("click", () => {
    alert(`Creat! (demo) Equips: ${state.teams}`);
    go(0);
  });

  teamsCount.addEventListener("change", () => {
    state.teams = teamsCount.value;
    teamsPreview.textContent = state.teams;
    teamsFinal.textContent = state.teams;
  });

  // Back/forward navegador
  globalThis.addEventListener("popstate", (e) => {
    if (e.state && typeof e.state.step === "number") {
      state.step = e.state.step;
      updateTrackPosition(false);
    } else {
      syncFromHash(false);
    }
  });

  const syncFromHashReg = new RegExp(/step-(\d+)/);
  function syncFromHash(pushHistory = true) {
    const m = syncFromHashReg.exec(location.hash);
    const step = m ? Number(m[1]) - 1 : 0;
    go(Number.isNaN(step) ? 0 : step, pushHistory);
  }

  // Adaptar mesures al redimensionar
  window.addEventListener("resize", () => updateTrackPosition(false));

  // Init
  syncFromHash(false);
  updateTrackPosition(false);
})();

// #endregion

// #region Pantalla de selecció d'quips
const teamQtSelector = document.getElementById("teams-count-choose");
let teamQtt = teamQtSelector.value;

teamQtSelector.addEventListener("change", setQt);

function setQt(event) {
    teamQtt = Number(event.target.value);
}

// #endregion