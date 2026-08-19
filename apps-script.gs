/**
 * Wedding invitation — the wishes inbox
 * Notes left on the invitation land in a Google Sheet; approved ones come back
 * to the page and appear on the wall under the form.
 *
 * SETUP (about five minutes)
 *  1. Create a new Google Sheet.
 *  2. In it: Extensions -> Apps Script. Delete the sample, paste this in, save.
 *  3. Deploy -> New deployment -> "Web app".
 *       Execute as     : Me
 *       Who has access : Anyone        <- must be "Anyone", NOT "Anyone with Google account"
 *     Authorise when asked (you will see an "unverified app" warning; it is your
 *     own script, so Advanced -> Go to project).
 *  4. Copy the /exec URL and paste it into invitation.html:
 *       inbox: { sheetUrl: "https://script.google.com/macros/s/AKfy.../exec", ... }
 *
 * The Wishes tab creates itself on the first submission.
 *
 * MODERATION: the "Show on page" column defaults to yes. Type no in any row and
 * that wish disappears from the public wall but stays in your sheet.
 *
 * After ANY edit here you must redeploy:
 * Deploy -> Manage deployments -> pencil -> Version: New version.
 */

var TAB          = 'Wishes';
var WALL_LIMIT   = 60;   // how many recent wishes the page shows
var NOTIFY_EMAIL = '';   // optional: your email, to be told about each new wish

var HEADERS = ['Time', 'Side', 'Name', 'Message', 'Show on page'];


/* ---------- writing ---------- */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); }
  catch (err) { return json({ ok: false, error: 'busy' }); }

  try {
    var d = JSON.parse(e.postData.contents);
    tab().appendRow([new Date(), d.side || '', d.name || '', d.message || '', 'yes']);
    notify(d);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function notify(d) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail(NOTIFY_EMAIL, 'A wish from ' + (d.name || 'someone'),
      (d.name || '') + ' (' + (d.side || '') + ') wrote:\n\n' + (d.message || ''));
  } catch (err) { /* a failed email must never fail the wish */ }
}


/* ---------- reading (the wall) ---------- */

function doGet(e) {
  var out;
  try {
    out = { ok: true, wishes: e.parameter.mode === 'wishes' ? readWishes() : [] };
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  var body = JSON.stringify(out);
  if (e.parameter.callback) {
    return ContentService.createTextOutput(e.parameter.callback + '(' + body + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function readWishes() {
  var sh = tab(), last = sh.getLastRow();
  if (last < 2) return [];

  var start = Math.max(2, last - 299);
  var rows = sh.getRange(start, 1, last - start + 1, HEADERS.length).getValues();
  var out = [];

  for (var i = rows.length - 1; i >= 0 && out.length < WALL_LIMIT; i--) {
    var r = rows[i];
    if (!r[3]) continue;
    if (String(r[4]).trim().toLowerCase() === 'no') continue;
    out.push({ name: String(r[2]), msg: String(r[3]) });
  }
  return out;
}


/* ---------- helpers ---------- */

function tab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1, 150);
    sh.setColumnWidth(4, 420);
  }
  return sh;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
