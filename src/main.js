import initSubnav from "./subnav.js";
import initTopnav from "./topnav.js";
import './filter.js'; // auto-runs
import { initSolutionCards } from "./solution-cards.js";

document.addEventListener("DOMContentLoaded", () => {
  initTopnav();
  initSubnav();
  initSolutionCards(); // <-- explicitly run it
});