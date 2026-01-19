// #region Sistema d'steps
(() => {
  const app = document.getElementById("app");
  const track = document.getElementById("track");
  const totalSteps = track.children.length;
  track.style.width = `${totalSteps * 100}vw`;

  const teamsCount = document.getElementById("teamsCount");

  const toStep2 = document.getElementById("toStep2");
  const toStep3 = document.getElementById("toStep3");
  const toStep4 = document.getElementById("toStep4");

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-back-step]");
    if (!btn) return;

    go(Number(btn.dataset.backStep));
  });

  const finish = document.getElementById("finish");

  const state = {
    step: 0, // 0..2
    teams: teamsCount.value,
    teamsNames: [],
  };

  function updateTrackPosition() {
    const pageWidth = app.clientWidth;
    const x = -(state.step * pageWidth);

    track.style.transform = `translateX(${x}px)`;
  }

  function go(step) {
    const last = totalSteps - 1;
    state.step = Math.max(0, Math.min(step, last));
    updateTrackPosition();
  }

  // Btn

  toStep2.addEventListener("click", () => {
    if (teamsCount.value < 2) return;
    state.teams = teamsCount.value;
    go(1);
  });

  toStep3.addEventListener("click", () => {
    if (teamsCount.value < 2) return;

    let elements = [];

    elements.forEach((el) => {
      let name = el.querySelector("input").value;

      if (!name) return;
      name = name.trim();

      if (elements.includes(name.toLowerCase())) return;

      elements.push(name.toLowerCase());
    });

    state.teamsNames = new Set(elements);

    go(2);
  });

  toStep4.addEventListener("click", () => {
    if (teamsCount.value < 2) return;
    
    go(3);
  });

  finish.addEventListener("click", () => {
    alert(`Creat! (demo) Equips: ${state.teams}`);
    go(0);
  });

  teamsCount.addEventListener("change", () => {
    state.teams = teamsCount.value;
  });

  // Adaptar mesures al redimensionar
  window.addEventListener("resize", () => updateTrackPosition());

  // Init
  updateTrackPosition();
})();

// #endregion

// #region Pantalla de selecció d'quips
const teamQtSelector = document.getElementById("teamsCount");
let teamQtt = teamQtSelector.value;
let lastTeamQtt = -1;

teamQtSelector.addEventListener("change", setQt);

function setQt(event) {
  teamQtt = Number(event.target.value);
  updateTable();
}

function getRowText(id) {
  return `
<tr class="bg-neutral-primary border-b border-default hover:bg-neutral-secondary-medium">
  <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
    ${id}
  </th>
  <td class="px-6 py-4">
    <input
      type="text"
      class="w-full px-3 py-2 rounded-lg bg-black text-white border border-slate-600 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Equip ${id}"
    >
  </td>
</tr>
`;
}

const teamRows = document.getElementById("teams-rows");
const teamsEnumCheckbox = document.getElementById("teams-enum");

function getEnum(index) {
  return (teamsEnumCheckbox.checked) ? String.fromCodePoint(65 + index) : String(index + 1);
}

teamsEnumCheckbox.addEventListener("change", () => {
  const elements = teamRows.querySelectorAll("tr");
  elements.forEach((el, i) => {
      const teamEnum = getEnum(i);
      el.querySelector("th").textContent = teamEnum;
      el.querySelector("input").placeholder = `Equip ${teamEnum}`;
    });
});

function updateTable() {
  if (lastTeamQtt == teamQtt) return;
  const dq = teamQtt - Math.max(lastTeamQtt, 0);
  lastTeamQtt = teamQtt;

  let elements = teamRows.querySelectorAll("tr");

  if (dq > 0) {
    for (let i = 0; i < dq; i++) {
      const teamEnum = getEnum(elements.length + i );
      teamRows.innerHTML += getRowText(teamEnum);
    }
    return;
  }

  for (let i = elements.length - 1; i > elements.length + dq; i--) {
    elements[i].remove();
  }

}

// #endregion
