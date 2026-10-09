(() => {
  const C = window.MFC_CONFIG || {};

  // Mobile menu
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.getElementById("nav");
  if (menuBtn && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // Links kept in config.js
  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const v = el.dataset.configHref.split(".").reduce((o, k) => (o ? o[k] : undefined), C);
    if (v) el.href = v;
  });

  // Countdown to the first loop
  const cd = document.getElementById("countdown");
  if (cd && C.raceStart) {
    const start = new Date(C.raceStart).getTime();
    const end = new Date(C.raceEnd).getTime();
    const label = document.getElementById("countdown-label");
    const units = Object.fromEntries([...cd.querySelectorAll("[data-u]")].map((el) => [el.dataset.u, el]));
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const now = Date.now();
      if (now >= start) {
        cd.classList.add("live");
        label.textContent = now < end ? "The Backyard Ultra is underway. A new loop starts every hour!" : "That's a wrap. Thank you for giving your miles a mission!";
        return clearInterval(timer);
      }
      let s = Math.floor((start - now) / 1000);
      const d = Math.floor(s / 86400); s %= 86400;
      units.d.textContent = d;
      units.h.textContent = pad(Math.floor(s / 3600));
      units.m.textContent = pad(Math.floor((s % 3600) / 60));
      units.s.textContent = pad(s % 60);
    };
    const timer = setInterval(tick, 1000);
    tick();
  }

  // Full race rules, from config.js
  const list = document.getElementById("rules-list");
  if (list && C.rules) {
    const LABELS = {
      startEnd: "Event start & end",
      loopStarts: "Loop starts",
      loopTimeLimit: "Time limit per loop",
      relayExchange: "Relay exchange rules",
      soloRequirements: "Solo runner requirements",
      aidStations: "Course support & aid stations",
      safety: "Safety procedures",
    };
    const chev = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    Object.entries(LABELS).forEach(([key, label]) => {
      const rule = C.rules[key];
      if (!rule || !rule.text) return;
      const d = document.createElement("details");
      const sum = document.createElement("summary");
      const t = document.createElement("span"); t.className = "t";
      const small = document.createElement("small"); small.textContent = label;
      t.append(small, rule.headline);
      const c = document.createElement("span"); c.className = "chev"; c.innerHTML = chev;
      sum.append(t, c);
      const p = document.createElement("p"); p.textContent = rule.text;
      d.append(sum, p);
      list.append(d);
    });
  }
})();
