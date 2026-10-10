(() => {
  const C = window.MFC_CONFIG;
  const form = document.getElementById("reg");
  const steps = [...form.querySelectorAll(".step")];
  const progress = [...document.querySelectorAll(".progress li")];
  const stepCount = document.getElementById("step-count");
  const submitBtn = document.getElementById("submit");
  const submitError = document.getElementById("submit-error");

  const STEP_NAMES = ["Choose Your Challenge", "Runner Information", "Challenge Details", "Emergency Contact & Race Day", "Invest in the Mission", "Waiver & Review"];
  const CHALLENGES = { solo: "100-Mile Solo Challenge", relay: "100-Mile Relay Team", loops: "Run a Few Loops" };
  const STATES = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

  const pick = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
  const today = new Date();
  const todayISO = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const submissionId = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
  let current = 0;
  let submitting = false;
  let teamsLoaded = false;

  // ---- Config-driven content ----
  document.querySelectorAll("[data-config]").forEach((el) => {
    const v = pick(C, el.dataset.config);
    el.textContent = v || "To be announced";
    el.classList.toggle("tba", !v);
  });
  document.querySelectorAll("[data-rule]").forEach((el) => {
    const rule = C.rules[el.dataset.rule] || {};
    if (!rule.headline && !rule.text) { el.textContent = "To be announced"; el.classList.add("tba"); return; }
    const h = document.createElement("b"); h.textContent = rule.headline || "";
    const p = document.createElement("p"); p.textContent = rule.text || "";
    el.replaceChildren(h, p);
  });
  document.querySelectorAll("[data-config-href]").forEach((el) => {
    const v = pick(C, el.dataset.configHref);
    if (v) el.href = v;
  });

  const waiver = document.getElementById("waiver");
  if (C.waiver.text) {
    waiver.textContent = C.waiver.text;
  } else if (C.waiver.url) {
    const a = document.createElement("a");
    a.href = C.waiver.url; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Read the official participant waiver";
    waiver.append(a);
  } else {
    waiver.textContent = "The official participant waiver will be posted here once it's approved by the race director.";
  }

  const stateSel = form.elements.state;
  STATES.forEach((s) => stateSel.add(new Option(s, s)));
  form.elements.sigDate.value = todayISO;
  document.getElementById("sigDateShown").value = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  form.elements.dob.max = todayISO;

  // Loops start on the hour from 1 PM Feb. 27; the last one starts at noon Feb. 28.
  const LOOP_TIMES = {
    "Sat., Feb. 27": [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    "Sun., Feb. 28": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  };
  const hourLabel = (h) => `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
  form.elements.startDay.addEventListener("change", (e) => {
    const sel = form.elements.startTime;
    const hours = LOOP_TIMES[e.target.value];
    sel.replaceChildren(new Option(hours ? "Select a time" : "Pick a day first", ""), ...(hours || []).map((h) => new Option(`${hourLabel(h)} loop`, hourLabel(h))));
  });

  // ---- Values & conditions ----
  function val(name) {
    const f = form.elements[name];
    if (!f) return "";
    if (f instanceof RadioNodeList) return f.value;
    if (f.type === "checkbox") return f.checked ? f.value : "";
    return f.value.trim();
  }

  function ageOnRaceDay() {
    const dob = val("dob");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
    const [y, m, d] = dob.split("-").map(Number);
    const [ry, rm, rd] = C.raceDay.split("-").map(Number);
    return ry - y - (rm < m || (rm === m && rd < d) ? 1 : 0);
  }
  const isMinor = () => { const a = ageOnRaceDay(); return a !== null && a < 18; };

  // data-when="key=a|b" or "key!=a". Hidden blocks have their inputs disabled so they skip validation and submission.
  function applyConditions() {
    form.querySelectorAll("[data-when]").forEach((el) => {
      const [, key, op, values] = el.dataset.when.match(/^(\w+)(!?=)(.*)$/);
      const actual = key === "minor" ? (isMinor() ? "yes" : "no") : val(key);
      const match = values.split("|").includes(actual);
      const parentHidden = el.parentElement.closest("[data-when][hidden]");
      const show = !parentHidden && (op === "=" ? match : !match);
      el.hidden = !show;
      el.querySelectorAll("input, select, textarea").forEach((i) => { i.disabled = !show; });
    });
  }

  // ---- Validation ----
  function checkField(f) {
    if (f.type === "radio") {
      const group = [...form.querySelectorAll(`[name="${f.name}"]`)].filter((r) => !r.disabled);
      return group.some((r) => r.required) && !group.some((r) => r.checked) ? "Please choose an option." : "";
    }
    if (f.type === "checkbox") return f.required && !f.checked ? "Please check this box to continue." : "";
    const v = f.value.trim();
    if (f.required && !v) return "This field is required.";
    if (!v) return "";
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address, like name@example.com.";
    if (f.type === "tel") {
      const d = v.replace(/\D/g, "");
      if (!(d.length === 10 || (d.length === 11 && d[0] === "1"))) return "Enter a 10-digit phone number.";
    }
    if (f.name === "zip" && !/^\d{5}(-\d{4})?$/.test(v)) return "Enter a 5-digit ZIP code.";
    if (f.type === "date") {
      if (v > todayISO) return "Date of birth can't be in the future.";
      if (v < "1900-01-01") return "Enter a valid date of birth.";
    }
    if (f.type === "number") {
      const n = Number(v);
      if (!Number.isInteger(n) || n < Number(f.min) || n > Number(f.max)) return `Enter a number from ${f.min} to ${f.max}.`;
    }
    return "";
  }

  function showError(f, msg) {
    const wrap = f.closest(".field, .group");
    let err = wrap.querySelector(":scope > .err");
    if (!err) {
      err = document.createElement("p");
      err.className = "err";
      err.id = "err-" + f.name;
      wrap.append(err);
    }
    err.textContent = msg;
    err.hidden = !msg;
    const targets = f.type === "radio" ? wrap.querySelectorAll(`[name="${f.name}"]`) : [f];
    targets.forEach((t) => {
      t.setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) t.setAttribute("aria-describedby", err.id); else t.removeAttribute("aria-describedby");
    });
  }

  function validateStep(i) {
    const seen = new Set();
    let first = null;
    steps[i].querySelectorAll("input, select, textarea").forEach((f) => {
      if (f.disabled || !f.name || f.type === "hidden" || f.readOnly || f.closest(".hp")) return;
      if (f.type === "radio") { if (seen.has(f.name)) return; seen.add(f.name); }
      const msg = checkField(f);
      showError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) first.focus();
    return !first;
  }

  form.addEventListener("input", (e) => { if (e.target.getAttribute("aria-invalid") === "true") showError(e.target, checkField(e.target)); });
  form.addEventListener("change", (e) => {
    applyConditions();
    if (e.target.getAttribute("aria-invalid") === "true") showError(e.target, checkField(e.target));
  });

  // Tidy phone numbers into (405) 555-0123.
  function formatPhone(f) {
    let d = f.value.replace(/\D/g, "");
    if (d.length === 11 && d[0] === "1") d = d.slice(1);
    if (d.length === 10) f.value = `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  form.addEventListener("focusout", (e) => { if (e.target.type === "tel") formatPhone(e.target); });

  // ---- Navigation ----
  function go(i, { scroll = true } = {}) {
    current = i;
    steps.forEach((s, j) => { s.hidden = j !== i; });
    progress.forEach((p, j) => {
      p.classList.toggle("done", j < i);
      p.classList.toggle("current", j === i);
      if (j === i) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
    });
    stepCount.textContent = `Step ${i + 1} of ${steps.length}: ${STEP_NAMES[i]}`;
    document.querySelectorAll("[data-chosen]").forEach((el) => { el.textContent = CHALLENGES[val("challenge")] || ""; });
    if (i === 2) loadTeams();
    if (i === 5) buildReview();
    if (scroll) {
      document.getElementById("register").scrollIntoView({ behavior: "smooth" });
      steps[i].querySelector(".step-title").focus({ preventScroll: true });
    }
  }

  function choose(challenge) {
    form.elements.challenge.value = challenge;
    document.querySelectorAll(".choice").forEach((c) => c.classList.toggle("selected", c.dataset.choice === challenge));
    applyConditions();
  }

  form.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.choose) { choose(t.dataset.choose); go(1); }
    else if (t.hasAttribute("data-next")) { if (validateStep(current)) go(current + 1); }
    else if (t.hasAttribute("data-back")) go(current - 1);
    else if (t.dataset.goto) go(Number(t.dataset.goto));
  });

  // ---- Relay teams ----
  async function loadTeams() {
    if (teamsLoaded || val("challenge") !== "relay") return;
    const sel = form.elements.teamId;
    const notListed = () => new Option("My relay group isn't listed", "other");
    // No list to choose from: go straight to typing the relay group name.
    const typeIt = () => { sel.replaceChildren(notListed()); sel.value = "other"; applyConditions(); };
    if (!C.scriptUrl) return typeIt();
    sel.replaceChildren(new Option("Loading relay groups…", ""));
    try {
      const res = await fetch(`${C.scriptUrl}?action=teams`);
      const data = await res.json();
      if (!data.ok) throw new Error();
      teamsLoaded = true;
      if (!data.teams.length) return typeIt();
      sel.replaceChildren(new Option("Select your relay group", ""), ...data.teams.map((t) => new Option(t.name, t.id)), notListed());
      applyConditions();
    } catch {
      typeIt();
    }
  }

  // ---- Review ----
  function teamLabel() {
    if (val("challenge") !== "relay") return "";
    if (val("teamMode") === "create") return `${val("teamName")} (new relay group, you're the captain)`;
    const sel = form.elements.teamId;
    if (sel.value === "other") return val("joinTeamName");
    return sel.value ? sel.options[sel.selectedIndex].text : "";
  }

  function buildReview() {
    form.querySelectorAll('[type="tel"]').forEach(formatPhone);
    const rows = [
      ["Challenge", CHALLENGES[val("challenge")], 0],
      ["Name", `${val("firstName")} ${val("lastName")}`, 1],
      ["Email", val("email"), 1],
      ["Phone", val("phone"), 1],
    ];
    if (val("challenge") === "relay") rows.push(["Relay group", teamLabel(), 2]);
    if (val("challenge") === "loops") {
      rows.push(["Estimated loops", val("estLoops"), 2]);
      rows.push(["First loop", `${val("startDay")} · ${val("startTime")}`, 2]);
    }
    rows.push(["Emergency contact", `${val("ecName")} (${val("ecRelation")}) · ${val("ecPhone")}`, 3]);
    if (isMinor()) rows.push(["Parent/guardian", `${val("guardianName")} · ${val("guardianPhone")}`, 3]);
    rows.push(["Registration donation", val("regDonation") === "Donated $50" ? "$50 donation made" : "Will donate $50 before race day", 4]);

    const review = document.getElementById("review");
    review.replaceChildren(...rows.map(([k, v, step]) => {
      const row = document.createElement("div");
      row.className = "row";
      const key = document.createElement("span"); key.className = "k"; key.textContent = k;
      const value = document.createElement("span"); value.className = "v"; value.textContent = v;
      const edit = document.createElement("button");
      edit.type = "button"; edit.className = "link"; edit.dataset.goto = step; edit.textContent = "Edit";
      edit.setAttribute("aria-label", `Edit ${k.toLowerCase()}`);
      row.append(key, value, edit);
      return row;
    }));
  }

  // ---- Submit ----
  function fail(msg) {
    submitError.textContent = msg;
    submitError.hidden = false;
    submitting = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Complete Registration";
    form.removeAttribute("aria-busy");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitting || current !== steps.length - 1) return;
    submitError.hidden = true;
    if (!validateStep(current)) return;
    if (!C.scriptUrl) return fail("Online registration isn't open yet. Please check back soon.");

    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    form.setAttribute("aria-busy", "true");

    form.querySelectorAll('[type="tel"]').forEach(formatPhone);
    const data = Object.fromEntries(new FormData(form));
    data.submissionId = submissionId;
    if (data.challenge === "relay" && data.teamMode === "join") data.teamName = teamLabel();

    try {
      // Sent as text/plain so the browser skips the CORS preflight that Apps Script can't answer.
      const res = await fetch(C.scriptUrl, { method: "POST", body: JSON.stringify(data) });
      const out = await res.json();
      if (!out.ok) return fail(out.error || "We couldn't save your registration. Please try again.");
      showConfirmation(out, data);
    } catch {
      fail("We couldn't reach the registration server. Check your connection and try again. Your answers are still here.");
    }
  });

  function showConfirmation(out, data) {
    form.hidden = true;
    document.querySelector(".progress").hidden = true;
    stepCount.hidden = true;
    const rows = [
      ["Participant", `${data.firstName} ${data.lastName}`],
      ["Challenge", CHALLENGES[data.challenge]],
    ];
    if (data.challenge === "relay") rows.push(["Relay group", out.teamName || data.teamName]);
    rows.push(["Date", C.event.date || "To be announced"], ["Location", C.event.location || "To be announced"], ["Confirmation #", out.registrationId]);
    document.getElementById("done-summary").replaceChildren(...rows.map(([k, v]) => {
      const d = document.createElement("div");
      if (k === "Confirmation #") d.className = "conf";
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v;
      d.append(dt, dd);
      return d;
    }));
    document.getElementById("done-donate").hidden = data.regDonation === "Donated $50";
    if (out.emailSent) document.getElementById("done-email").textContent = `A confirmation email is on its way to ${data.email}.`;
    const done = document.getElementById("done");
    done.hidden = false;
    document.getElementById("register").scrollIntoView({ behavior: "smooth" });
    done.focus({ preventScroll: true });
  }

  document.getElementById("share").addEventListener("click", async (e) => {
    const url = C.links.site || location.origin;
    const shareData = { title: "Miles For Champions Backyard Ultra", text: "I just registered for the Miles For Champions Backyard Ultra. Give your miles a mission!", url };
    try {
      if (navigator.share) return await navigator.share(shareData);
      await navigator.clipboard.writeText(url);
      e.target.textContent = "Link Copied!";
    } catch { /* share sheet dismissed */ }
  });

  // ---- Start ----
  const preset = new URLSearchParams(location.search).get("challenge");
  applyConditions();
  if (CHALLENGES[preset]) {
    choose(preset);
    go(1);
  } else {
    go(0, { scroll: false });
  }
})();
