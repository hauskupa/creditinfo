import initSubnav from "./subnav.js";
import initTopnav from "./topnav.js";
import { initSolutionCards } from "./solution-cards.js";
import { initFilter } from "./filter.js";

document.addEventListener("DOMContentLoaded", () => {
  initTopnav();
  initSubnav();
  initSolutionCards();
  initFilter({ observe: true }); // keeps working with dynamically injected content
});