// #region Sistema d'steps
(() => {
  const app = document.getElementById("app");
  const track = document.getElementById("track");

  const teamsCount = document.getElementById("teamsCount");

  const toStep2 = document.getElementById("toStep2");
  const toStep3 = document.getElementById("toStep3");

  const backToStep1 = document.getElementById("backToStep1");
  const backToStep2 = document.getElementById("backToStep2");
  
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
    state.step = Math.max(0, Math.min(step, 2));
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

  

  backToStep1.addEventListener("click", () => go(0));
  backToStep2.addEventListener("click", () => go(1));

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
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Equip ${id}"
    >
  </td>
</tr>
`;
}

const teamRows = document.getElementById("teams-rows");
const teamsEnumCheckbox = document.getElementById("teams-enum");

teamsEnumCheckbox.addEventListener("change", () => {
  const elements = teamRows.querySelectorAll("tr");
  if (teamsEnumCheckbox.checked) {
    elements.forEach((el) => {
      const teamEnum = String.fromCodePoint(65 + Array.from(elements).indexOf(el));
      el.querySelector("th").textContent = teamEnum;
      el.querySelector("input").placeholder = `Equip ${teamEnum}`;
    });

  } else {
    elements.forEach((el, i) => {
      const teamEnum = String(i + 1);
      el.querySelector("th").textContent = teamEnum;
      el.querySelector("input").placeholder = `Equip ${teamEnum}`;
    });
  }
});

function updateTable() {
  if (lastTeamQtt == teamQtt) return;
  const dq = teamQtt - Math.max(lastTeamQtt, 0);
  lastTeamQtt = teamQtt;

  let elements = teamRows.querySelectorAll("tr");

  if (dq > 0) {
    for (let i = 0; i < dq; i++) {
      teamRows.innerHTML += getRowText(elements.length + i + 1);
    }
    return;
  }

  for (let i = elements.length - 1; i > elements.length + dq; i--) {
    elements[i].remove();
  }

}

// #endregion

// #region Pantalla de noms d'quips

// #endregion