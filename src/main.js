console.log("test-2025-09-24 from src/main.js");
import initSubnav from "./subnav.js";
import initTopnav from "./topnav.js";
import { initSolutionCards } from "./solution-cards.js";
import { initFilter } from "./filter.js";
import { initStaffCards } from "./staff-cards.js";
import { initSlider, initParallax } from "./slider.js";

document.addEventListener("DOMContentLoaded", () => {
  initTopnav();
  initSubnav();
  initSolutionCards();
  initFilter({ observe: true }); // keeps working with dynamically injected content
  initStaffCards();
  initSlider();    // initialize slider
  initParallax();  // optional: initialize parallax (safe if already auto-inited)
});