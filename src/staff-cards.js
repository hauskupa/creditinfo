/**
 * staff-cards.js
 * Converted to an idempotent module for the project.
 *
 * Usage:
 *   import { initStaffCards } from './staff-cards.js';
 *   initStaffCards(); // idempotent
 *
 * The module will also auto-init once if included directly in a bundle and DOMContentLoaded
 * hasn't fired yet.
 */

export function initStaffCards() {
  // guard global double-init (in case main also calls it)
  if (window.__creditinfo_staff_cards_inited) return;
  window.__creditinfo_staff_cards_inited = true;

  const wrappers = Array.from(document.querySelectorAll('[data-team="wrap"]'));
  if (!wrappers.length) return;

  wrappers.forEach((wrap) => {
    if (wrap.__staffCardsAttached) return;
    wrap.__staffCardsAttached = true;

    const grid = wrap.querySelector('[data-team="grid"]');
    if (!grid) return;

    // Floating panel (used only for last column)
    let panel = wrap.querySelector('.bio-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'bio-panel';
      wrap.appendChild(panel);
    }

    const cards = Array.from(grid.querySelectorAll('.team-card'));
    cards.forEach(c => c.classList.add('is-closed'));

    // Track current open state
    let activeCard = null;
    let activeBio = null;     // the .bio element when using GRID mode
    let mode = null;          // 'grid' or 'panel'

    function colInfo() {
      const styles = getComputedStyle(grid);
      const cols = styles.getPropertyValue('grid-template-columns').trim().split(' ').filter(Boolean);
      const colCount = cols.length || 1;

      const gridRect = grid.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      const gap = parseFloat(styles.getPropertyValue('column-gap')) || 0;
      const paddingLeft = parseFloat(styles.getPropertyValue('padding-left')) || 0;

      const gridInnerWidth = grid.clientWidth;
      const colWidth = (gridInnerWidth - gap * (colCount - 1)) / colCount;
      const contentLeft = gridRect.left - wrapRect.left + paddingLeft;

      return { colCount, colWidth, gap, contentLeft, wrapRect };
    }

    function indexOfCard(card) {
      return cards.indexOf(card);
    }

    function setCardStates(current) {
      cards.forEach(c => {
        const active = c === current;
        c.classList.toggle('is-open', active);
        c.classList.toggle('is-closed', !active);
        c.classList.toggle('dim', !active);
        const t = c.querySelector('.team-trigger[aria-expanded]');
        if (t) t.setAttribute('aria-expanded', active ? 'true' : 'false');
      });
    }

    function closeAll() {
      // hide/detach whichever mode was used
      if (mode === 'grid' && activeBio && activeCard) {
        // move bio back into its card
        activeBio.style.removeProperty('grid-column');
        activeBio.style.removeProperty('grid-row');
        activeCard.appendChild(activeBio);
      }
      if (mode === 'panel') {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
      }
      activeCard = null;
      activeBio = null;
      mode = null;

      // reset cards
      cards.forEach(c => {
        c.classList.remove('is-open','dim');
        c.classList.add('is-closed');
        const t = c.querySelector('.team-trigger[aria-expanded]');
        if (t) t.setAttribute('aria-expanded','false');
      });
    }

    function openAsGrid(card, colIndex, rowIndex) {
      const bio = card.querySelector('.bio');
      if (!bio) return;

      // Insert the SAME .bio as a sibling grid child, right after the card
      if (card.nextSibling) {
        grid.insertBefore(bio, card.nextSibling);
      } else {
        grid.appendChild(bio);
      }

      // Place it into the next column on the same row
      bio.style.gridColumn = (colIndex + 1) + ' / span 1';
      bio.style.gridRow = rowIndex;

      activeBio = bio;
      mode = 'grid';
    }

    function openAsPanel(card, colIndex) {
      // Copy the card's bio HTML into the floating panel
      const source = card.querySelector('.bio');
      panel.innerHTML = source ? source.innerHTML : '<p>No bio available.</p>';

      // Snap panel to the neighbor column (left of last-col card)
      const { colWidth, gap, contentLeft, wrapRect, colCount } = colInfo();
      const neighborCol = (colIndex === colCount) ? (colIndex - 1) : (colIndex + 1);

      const cardRect = card.getBoundingClientRect();
      const top = cardRect.top - wrapRect.top;
      const left = contentLeft + (neighborCol - 1) * (colWidth + gap);

      panel.style.width = colWidth + 'px';
      panel.style.left  = left + 'px';
      panel.style.top   = top + 'px';

      requestAnimationFrame(() => panel.classList.add('is-open'));
      mode = 'panel';
    }

    function openCard(card) {
      const { colCount } = colInfo();
      const idx = indexOfCard(card);
      const colIndex = (idx % colCount) + 1;
      const rowIndex = Math.floor(idx / colCount) + 1;

      setCardStates(card);

      // Mobile / single-column: keep the original .bio inside the card (no panel, no move)
      if (colCount === 1) {
        // restore any previously moved bio back into its card and close panel
        if (activeBio && activeCard) {
          activeBio.style.removeProperty('grid-column');
          activeBio.style.removeProperty('grid-row');
          activeCard.appendChild(activeBio);
          activeBio = null;
        }
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        mode = 'inline';
      }
      // Multi-column: grid or panel as before
      else if (colIndex < colCount) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        openAsGrid(card, colIndex, rowIndex);
      } else {
        if (activeBio && activeCard) {
          activeBio.style.removeProperty('grid-column');
          activeBio.style.removeProperty('grid-row');
          activeCard.appendChild(activeBio);
          activeBio = null;
        }
        openAsPanel(card, colIndex);
      }

      activeCard = card;
    }

    function toggleCard(card) {
      if (card.classList.contains('is-open')) {
        closeAll();
      } else {
        closeAll();
        openCard(card);
      }
    }

    // Click handling (delegate)
    if (!grid.__teamGridClickAttached) {
      grid.__teamGridClickAttached = true;
      grid.addEventListener('click', (e) => {
        const trigger = e.target.closest('.team-trigger');
        if (!trigger || !grid.contains(trigger)) return;
        e.preventDefault();
        const card = trigger.closest('.team-card');
        if (card) toggleCard(card);
      });
    }

    // Outside click / ESC (attach once per wrap)
    if (!wrap.__teamGlobalHandlers) {
      wrap.__teamGlobalHandlers = true;
      document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closeAll(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
    }

    // Recompute on resize/scroll (breakpoints/position changes)
    function realignIfOpen() {
      if (!activeCard || !activeCard.classList.contains('is-open')) return;
      const { colCount } = colInfo();
      const idx = indexOfCard(activeCard);
      const colIndex = (idx % colCount) + 1;
      const rowIndex = Math.floor(idx / colCount) + 1;

      // If grid collapsed to one column, force inline mode: restore any moved bio and close panel
      if (colCount === 1) {
        if (activeBio && activeCard) {
          activeBio.style.removeProperty('grid-column');
          activeBio.style.removeProperty('grid-row');
          activeCard.appendChild(activeBio);
          activeBio = null;
        }
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        mode = 'inline';
        return;
      }

      if (colIndex < colCount) {
        // should be GRID mode
        if (mode !== 'grid') {
          // switch from panel -> grid
          panel.classList.remove('is-open'); panel.innerHTML = '';
          openAsGrid(activeCard, colIndex, rowIndex);
        } else {
          // already grid; ensure placement is correct
          if (activeBio) {
            activeBio.style.gridColumn = (colIndex + 1) + ' / span 1';
            activeBio.style.gridRow = rowIndex;
            // ensure it's right after the card in DOM
            if (activeBio.previousSibling !== activeCard) {
              if (activeCard.nextSibling) {
                grid.insertBefore(activeBio, activeCard.nextSibling);
              } else {
                grid.appendChild(activeBio);
              }
            }
          }
        }
      } else {
        // should be PANEL mode
        if (mode === 'grid' && activeBio && activeCard) {
          activeBio.style.removeProperty('grid-column');
          activeBio.style.removeProperty('grid-row');
          activeCard.appendChild(activeBio);
          activeBio = null;
        }
        openAsPanel(activeCard, colIndex);
      }
    }

    window.addEventListener('resize', realignIfOpen);
    window.addEventListener('scroll', realignIfOpen, { passive: true });
  });
}

// Auto-init once after DOM ready if not already called by app
if (!window.__creditinfo_staff_cards_auto_init) {
  window.__creditinfo_staff_cards_auto_init = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStaffCards);
  } else {
    // DOM already ready — run immediately
    initStaffCards();
  }
}
