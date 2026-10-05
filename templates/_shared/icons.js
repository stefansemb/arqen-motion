// Simple 24x24 line icons for templates. M.icon("code") returns an <svg> string; unknown names fall back to a dot.
(function () {
  const ICONS = {
    code: '<polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/>',
    browser: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><line x1="2.5" y1="9" x2="21.5" y2="9"/><circle cx="6" cy="6.5" r=".6"/><circle cx="8.5" cy="6.5" r=".6"/><circle cx="11" cy="6.5" r=".6"/>',
    bolt: '<polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>',
    video: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><polygon points="10 9 15 12 10 15 10 9"/>',
    mic: '<rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><line x1="12" y1="18" x2="12" y2="21.5"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><polyline points="21 15 16 10 5 21"/>',
    chart: '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="11" width="3" height="7"/><rect x="11" y="6" width="3" height="12"/><rect x="16" y="13" width="3" height="5"/>',
    spark: '<path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><ellipse cx="12" cy="12" rx="4" ry="9.5"/><line x1="2.5" y1="12" x2="21.5" y2="12"/>',
    file: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><polyline points="14 2.5 14 8 19.5 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-12.3 7.6L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/>',
    cloud: '<path d="M7 19a5 5 0 1 1 .9-9.9A6.5 6.5 0 0 1 20 11a4 4 0 0 1-1.5 8z"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="11" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    play: '<polygon points="7 4 20 12 7 20 7 4"/>',
    check: '<polyline points="4 12.5 9.5 18 20 6"/>',
    upload: '<path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/><polyline points="7 8 12 3 17 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    money: '<line x1="12" y1="2" x2="12" y2="22"/><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    rocket: '<path d="M12 2c3.5 2.5 5 6 5 10l-2 4H9l-2-4c0-4 1.5-7.5 5-10z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 16l-2.5 3.5M15 16l2.5 3.5M12 17v4"/>',
  };
  window.MOTION_ICONS = Object.keys(ICONS);
  window.M.icon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${
      ICONS[String(name || "").trim().toLowerCase()] ?? '<circle cx="12" cy="12" r="3"/>'
    }</svg>`;
})();
