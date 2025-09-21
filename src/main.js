import initSubnav from "./subnav.js";
import initTopnav from "./topnav.js";
import './filter.js';  // runs automatically, no variable needed

document.addEventListener("DOMContentLoaded", () => {
  initTopnav();
  initSubnav();
});
