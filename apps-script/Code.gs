/**
 * Miles For Champions: Backyard Ultra registration backend.
 *
 * Lives inside the "Miles For Champions" Google Sheet (Extensions → Apps Script).
 * Saves each registration to the Registrations tab, tracks relay teams on the Teams tab,
 * and keeps live counts on the Summary tab. Setup steps are in the repo README.
 */

const SEND_CONFIRMATION_EMAILS = true;

const EVENT = {
  name: 'Miles For Champions Backyard Ultra',
  date: 'Saturday, Feb. 27 – Sunday, Feb. 28, 2027',
  startTime: '1:00 PM Saturday · finishes 1:00 PM Sunday',
  location: 'Private property about 3 miles east of Lake Arcadia, Oklahoma City',
  raceDay: '2027-02-27',
  site: 'https://milesforchampions.com/',
  donate: 'https://www.givengain.com/project/ryan-raising-funds-for-special-olympics-massachusetts-128642',
};

const CHALLENGES = { solo: '100-Mile Solo', relay: '100-Mile Relay Team', loops: 'Run a Few Loops' };

// [column header, record key]
const REG_COLUMNS = [
  ['Timestamp', 'timestamp'],
  ['Registration ID', 'registrationId'],
  ['Challenge', 'challengeLabel'],
  ['First Name', 'firstName'],
  ['Last Name', 'lastName'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Date of Birth', 'dob'],
  ['Age on Race Day', 'age'],
  ['Street Address', 'street'],
  ['City', 'city'],
  ['State', 'state'],
  ['ZIP Code', 'zip'],
  ['Gender', 'gender'],
  ['Running Club', 'club'],
  ['T-Shirt Size', 'shirt'],
  ['Completed Ultra Before', 'ultraBefore'],
  ['Longest Distance', 'longest'],
  ['Team Role', 'teamRole'],
  ['Team ID', 'teamId'],
  ['Team Name', 'teamName'],
  ['Est. Team Size', 'teamSize'],
  ['Estimated Loops', 'estLoops'],
  ['First Loop Day', 'startDay'],
  ['First Loop Time', 'startTime'],
  ['Emergency Contact', 'ecName'],
  ['Emergency Phone', 'ecPhone'],
  ['Emergency Relationship', 'ecRelation'],
  ['First Backyard Ultra', 'firstBackyard'],
  ['Crew / Support Person', 'crew'],
  ['Medical / Allergies', 'medical'],
  ['Pre-Race Support Notes', 'accessibility'],
  ['Heard About Us', 'heardAbout'],
  ['Registration Donation', 'regDonation'],
  ['Waiver Agreed', 'agreeWaiver'],
  ['Rules Agreed', 'agreeRules'],
  ['Info Accurate', 'agreeAccurate'],
  ['Photo Release', 'photoRelease'],
  ['Signature', 'signature'],
  ['Signature Date', 'sigDate'],
  ['Minor', 'minor'],
  ['Guardian Name', 'guardianName'],
  ['Guardian Relationship', 'guardianRelation'],
  ['Guardian Phone', 'guardianPhone'],
  ['Guardian Email', 'guardianEmail'],
  ['Guardian Consent', 'guardianConsent'],
  ['Guardian Signature', 'guardianSignature'],
  ['Submission ID', 'submissionId'],
];

const TEAM_HEADERS = ['Team ID', 'Team Name', 'Captain Registration ID', 'Captain Name', 'Captain Email', 'Est. Team Size', 'Created', 'Registered Members'];

/** Run once from the Apps Script editor to build the tabs, headers, and Summary. Safe to re-run. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let reg = ss.getSheetByName('Registrations');
  if (!reg) {
    const first = ss.getSheets()[0];
    reg = first.getLastRow() <= 1 && !ss.getSheetByName('Registrations') ? first.setName('Registrations') : ss.insertSheet('Registrations');
  }
  writeHeader_(reg, REG_COLUMNS.map((c) => c[0]));
  // Keep phone numbers, dates, and IDs exactly as entered.
  reg.getRange(2, 1, reg.getMaxRows() - 1, REG_COLUMNS.length).setNumberFormat('@');

  const teams = ss.getSheetByName('Teams') || ss.insertSheet('Teams');
  writeHeader_(teams, TEAM_HEADERS);

  buildSummary_(ss);
  ss.setActiveSheet(ss.getSheetByName('Summary'));
  ss.moveActiveSheet(1);
}

function writeHeader_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#0e7490').setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

function col_(header) {
  const i = REG_COLUMNS.findIndex((c) => c[0] === header);
  let n = i + 1, s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return `Registrations!${s}2:${s}`;
}

function buildSummary_(ss) {
  const sum = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  sum.clear();
  const ch = col_('Challenge'), loops = col_('Estimated Loops'), don = col_('Registration Donation'), minor = col_('Minor'), shirt = col_('T-Shirt Size');
  const rows = [
    ['Miles For Champions Backyard Ultra', ''],
    ['', ''],
    ['Participants', ''],
    ['Total registered participants', `=COUNTA(${col_('Registration ID')})`],
    ['100-mile solo runners', `=COUNTIF(${ch},"${CHALLENGES.solo}")`],
    ['Relay teams', '=COUNTA(Teams!A2:A)'],
    ['Relay participants', `=COUNTIF(${ch},"${CHALLENGES.relay}")`],
    ['Few-loop participants', `=COUNTIF(${ch},"${CHALLENGES.loops}")`],
    ['Minors (need guardian consent)', `=COUNTIF(${minor},"Yes")`],
    ['', ''],
    ['Estimated loops (few-loop runners)', ''],
  ].concat(
    Array.from({ length: 15 }, (_, i) => { const l = `${i + 1} loop${i ? 's' : ''}`; return [l, `=COUNTIF(${loops},"${l}")`]; }),
    [['Not sure yet', `=COUNTIF(${loops},"Not sure yet")`],
    ['Total estimated loops', `=SUMPRODUCT(IFERROR(VALUE(REGEXEXTRACT(${loops},"^\\d+")),0))`],
    ['', ''],
    ['$50 registration donations', ''],
    ['Said they donated $50 at registration', `=COUNTIF(${don},"Donated $50")`],
    ['Will donate before race day (follow up)', `=COUNTIF(${don},"Will donate before race day")`],
    ['Expected registration donations ($)', `=50*COUNTA(${col_('Registration ID')})`],
    ['', ''],
    ['T-shirt sizes', ''],
  ]).concat(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((s) => [s, `=COUNTIF(${shirt},"${s}")`]));
  sum.getRange(1, 1, rows.length, 2).setValues(rows);
  sum.getRange('A1').setFontSize(16).setFontWeight('bold');
  rows.forEach((row, i) => { if (row[0] && !row[1] && i > 0) sum.getRange(i + 1, 1).setFontWeight('bold').setFontColor('#c2410c'); });
  sum.setColumnWidth(1, 320);
}

// ---------- Web app ----------

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'teams') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Teams');
    const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues() : [];
    // Only team IDs and names are public; no personal details.
    const teams = rows.filter((r) => r[0]).map((r) => ({ id: String(r[0]), name: String(r[1]) }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return json_({ ok: true, teams });
  }
  return json_({ ok: true, service: 'Miles For Champions registration' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    Object.keys(d).forEach((k) => { d[k] = String(d[k] == null ? '' : d[k]).trim().slice(0, 1000); });
    if (d.website) return json_({ ok: false, error: 'Submission rejected.' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const reg = ss.getSheetByName('Registrations');
    const teams = ss.getSheetByName('Teams');

    // Same submission retried (double click, flaky network): return the original registration.
    const dup = findRow_(reg, 'Submission ID', d.submissionId);
    if (d.submissionId && dup) {
      return json_({ ok: true, duplicate: true, registrationId: dup['Registration ID'], teamName: dup['Team Name'] });
    }

    const age = ageOnRaceDay_(d.dob);
    const minor = age !== null && age < 18;
    const error = validate_(d, minor);
    if (error) return json_({ ok: false, error });

    // Check the team before using up a registration number.
    let team = null;
    if (d.challenge === 'relay') {
      if (d.teamMode === 'create' && findTeamByName_(teams, d.teamName)) {
        return json_({ ok: false, error: `A team named "${d.teamName}" already exists. Pick a different name, or go back and choose "I'm joining an existing team".` });
      }
      if (d.teamMode !== 'create') {
        team = findTeamById_(teams, d.teamId);
        if (!team) return json_({ ok: false, error: "We couldn't find that team. Refresh the page and pick your team again." });
      }
    }

    const now = new Date();
    const stamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const registrationId = 'MFC-' + nextSeq_('reg', 1000);
    const rec = Object.assign({}, d, {
      timestamp: stamp,
      registrationId,
      challengeLabel: CHALLENGES[d.challenge],
      age: age === null ? '' : String(age),
      minor: minor ? 'Yes' : 'No',
      teamRole: '', teamId: '', teamName: '',
    });
    if (d.challenge !== 'solo') rec.ultraBefore = rec.longest = '';
    if (d.challenge === 'solo') rec.crew = d.soloCrew;

    if (d.challenge === 'relay') {
      if (d.teamMode === 'create') {
        rec.teamId = 'T-' + nextSeq_('team', 100);
        rec.teamName = d.teamName;
        rec.teamRole = 'Captain';
        teams.appendRow([rec.teamId, d.teamName, registrationId, `${d.firstName} ${d.lastName}`, d.email, d.teamSize, stamp].map(safe_));
        const r = teams.getLastRow();
        teams.getRange(r, 8).setFormula(`=COUNTIF(${col_('Team ID')},A${r})`);
      } else {
        rec.teamId = team.id;
        rec.teamName = team.name;
        rec.teamRole = 'Member';
      }
    }

    reg.appendRow(REG_COLUMNS.map((c) => safe_(rec[c[1]] || '')));
    SpreadsheetApp.flush();

    let emailSent = false;
    if (SEND_CONFIRMATION_EMAILS) {
      try { sendConfirmation_(rec); emailSent = true; } catch (err) { console.error('Email failed: ' + err); }
    }
    return json_({ ok: true, registrationId, teamName: rec.teamName, emailSent });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Something went wrong saving your registration. Please try again.' });
  } finally {
    lock.releaseLock();
  }
}

// ---------- Helpers ----------

function validate_(d, minor) {
  if (!CHALLENGES[d.challenge]) return 'Please choose a challenge.';
  const required = ['firstName', 'lastName', 'email', 'phone', 'dob', 'street', 'city', 'state', 'zip', 'ecName', 'ecPhone', 'ecRelation', 'firstBackyard', 'regDonation', 'agreeWaiver', 'agreeRules', 'agreeAccurate', 'signature'];
  if (d.challenge === 'solo') required.push('ultraBefore', 'longest', 'soloCrew');
  else required.push('crew');
  if (d.challenge === 'relay') required.push('teamMode', d.teamMode === 'create' ? 'teamName' : 'teamId');
  if (d.challenge === 'relay' && d.teamMode === 'create') required.push('teamSize');
  if (d.challenge === 'loops') required.push('estLoops', 'startDay', 'startTime');
  if (minor) required.push('guardianName', 'guardianRelation', 'guardianPhone', 'guardianEmail', 'guardianConsent', 'guardianSignature');
  const missing = required.filter((k) => !d[k]);
  if (missing.length) return 'Some required information is missing. Please go back and complete every required field.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return 'Please enter a valid email address.';
  if (ageOnRaceDay_(d.dob) === null) return 'Please enter a valid date of birth.';
  if (!/^\d{5}(-\d{4})?$/.test(d.zip)) return 'Please enter a valid ZIP code.';
  return '';
}

function ageOnRaceDay_(dob) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob || '')) return null;
  const [y, m, d] = dob.split('-').map(Number);
  const [ry, rm, rd] = EVENT.raceDay.split('-').map(Number);
  return ry - y - (rm < m || (rm === m && rd < d) ? 1 : 0);
}

function nextSeq_(name, start) {
  const props = PropertiesService.getScriptProperties();
  const n = Number(props.getProperty('seq_' + name) || start) + 1;
  props.setProperty('seq_' + name, String(n));
  return n;
}

function findRow_(sheet, header, value) {
  if (!value || sheet.getLastRow() < 2) return null;
  const data = sheet.getDataRange().getValues();
  const idx = data[0].indexOf(header);
  const row = data.slice(1).find((r) => String(r[idx]) === value);
  return row ? Object.fromEntries(data[0].map((h, i) => [h, row[i]])) : null;
}

function teamRows_(teams) {
  return teams.getLastRow() > 1 ? teams.getRange(2, 1, teams.getLastRow() - 1, 2).getValues().map((r) => ({ id: String(r[0]), name: String(r[1]) })) : [];
}
function findTeamByName_(teams, name) {
  const key = name.toLowerCase().replace(/\s+/g, ' ');
  return teamRows_(teams).find((t) => t.name.toLowerCase().replace(/\s+/g, ' ') === key);
}
function findTeamById_(teams, id) {
  return teamRows_(teams).find((t) => t.id === id);
}

// Stop spreadsheet formula injection from form input.
function safe_(v) {
  const s = String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function sendConfirmation_(rec) {
  const rows = [
    ['Participant', `${rec.firstName} ${rec.lastName}`],
    ['Challenge', rec.challengeLabel],
  ];
  if (rec.teamName) rows.push(['Team', `${rec.teamName}${rec.teamRole === 'Captain' ? ' (captain)' : ''}`]);
  if (rec.startDay) rows.push(['First loop (estimated)', `${rec.startDay} · ${rec.startTime}`]);
  rows.push(['Registration donation', rec.regDonation === 'Donated $50' ? '$50 donation made' : 'Due before race day']);
  rows.push(['Date', EVENT.date], ['Start', EVENT.startTime], ['Location', EVENT.location], ['Confirmation #', rec.registrationId]);

  const table = rows.map(([k, v]) =>
    `<tr><td style="padding:8px 16px 8px 0;color:#777;text-transform:uppercase;font-size:12px;letter-spacing:1px">${esc_(k)}</td><td style="padding:8px 0;font-weight:bold">${esc_(v)}</td></tr>`).join('');
  const donateNote = rec.regDonation === 'Donated $50' ? ''
    : `<p style="padding:12px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px"><b>One last step:</b> your spot is confirmed once your $50 registration donation is received. <a href="${EVENT.donate}" style="color:#c2410c;font-weight:bold">Make your $50 donation</a>.</p>`;
  const captainNote = rec.teamRole === 'Captain'
    ? `<p>You're the captain of <b>${esc_(rec.teamName)}</b>. Send your teammates to <a href="${EVENT.site}register.html?challenge=relay">the registration page</a>. Each of them registers on their own and selects your team.</p>` : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#111">
      <h1 style="color:#c2410c;font-style:italic;text-transform:uppercase;margin-bottom:4px">You're In!</h1>
      <h2 style="margin-top:0">Welcome to the Miles for Champions Backyard Ultra!</h2>
      <p>You're officially part of something bigger than a race.</p>
      <p>Whether you're taking on 100 miles, joining a team, or running a few loops, your miles are helping us champion inclusion, opportunity, and the power of sports.</p>
      <p style="font-weight:bold;text-transform:uppercase;color:#c2410c">Give Your Miles a Mission.</p>
      <table style="border-collapse:collapse;margin:16px 0">${table}</table>
      ${donateNote}
      ${captainNote}
      <p><a href="${EVENT.site}" style="color:#c2410c">milesforchampions.com</a></p>
    </div>`;

  MailApp.sendEmail({
    to: rec.email,
    subject: "You're In! Miles for Champions Backyard Ultra",
    htmlBody: html,
    name: 'Miles For Champions',
  });
}
