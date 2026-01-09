// #region Pantalla de selecció d'quips
const teamQtSelector = document.getElementById("teams-count-choose");
let teamQtt = teamQtSelector.value;

teamQtSelector.addEventListener("change", setQt);

function setQt(event) {
    teamQtt = Number(event.target.value);
}

// #endregion