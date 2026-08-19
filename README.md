# Prashasy & Garima — Digital Wedding Invitation

Complete reference for the invitation: how it works, every query parameter, every
config key, all assets, and what is still outstanding.

- **Couple:** Prashasy Yadav & Garima Yadav
- **Wedding:** Monday, 7 December 2026, 8:00 PM, Ramada, Lucknow
- **Hashtag:** `#PrashasyKiGarima`
- **Events:** 4–7 December 2026, Lucknow
- **Built as:** one self-contained HTML file, no build step, no framework, no server

---

## 1. Files

```
prashasy-garima-invitation/
├── invitation.html          ← the entire invitation. This is the product.
├── README.md                ← this document
├── apps-script.gs           ← paste into Google Apps Script for the wish wall
├── characters/
│   ├── bride.png            full-quality cutout, transparent (412 × 818)
│   ├── groom.png            full-quality cutout, transparent (304 × 946)
│   ├── bride.webp           the compressed file embedded in the HTML
│   ├── groom.webp           the compressed file embedded in the HTML
│   ├── source-original.png  the untouched artwork both were cut from
│   └── ABOUT.txt
├── photos/
│   └── PUT-PHOTOS-HERE.txt  ← us-01…us-06.jpg and og-cover.jpg go here
└── audio/
    └── PUT-MUSIC-HERE.txt   ← optional background track
```

**To publish, you only need `invitation.html` and the `photos/` folder.** Everything
else is either setup (`apps-script.gs`) or spare parts (`characters/`).

| File | Needed to publish? |
|---|---|
| `invitation.html` | **Yes** — self-contained, ~244 KB |
| `photos/*.jpg` | Yes, once you have them |
| `apps-script.gs` | Only if you want the wish wall |
| `characters/*` | No — both are already inside the HTML |
| `README.md` | No |

### A note on the caricatures

The two PNGs were cut out of the Gemini image using a matting model, with the
plinths cropped off. They are **already base64-embedded inside `invitation.html`**
as WebP, so the invitation works as a genuinely single file with no image
dependencies. The separate PNGs are supplied only in case you want them elsewhere —
WhatsApp stickers, printed cards, a calendar-invite image.

Their artwork aspect ratios differ a lot (bride 0.50 wide-to-tall, groom 0.32), so
everywhere in the CSS they are sized by **height**, never width. The tokens
`--ch-g: 1` and `--ch-b: .94` set the ratio between them. Changing `--ch-b` is the
one-line way to adjust their relative heights.

---

## 2. Query parameters

The invitation is one file that renders differently per guest, driven entirely by
the URL. Nothing is stored server-side.

| Parameter | Values | Default | Effect |
|---|---|---|---|
| `host` | `groom` \| `bride` | `groom` | Which family's invitation. Changes the wording, whose name comes first, the schedule and the addresses. |
| `to` | any text | *(none)* | Guest's name. Printed on the cover ("Welcome, Sharma Family") and as a badge on the invitation card. URL-encode it. |
| `ev` | letter codes, or `all` | all events | Which events this guest is invited to. Also filters the addresses. |
| `preview` | `1` | off | Testing only. Shows a side switcher and the active event codes in the footer. **Never send this to a guest.** |
| `motion` | `reduce` | *(off)* | Animations play for **everyone** by default, whatever the device's reduced-motion setting says. `?motion=reduce` is the only way to get the calm, static version. |

### `host` — what actually changes

| | `host=groom` | `host=bride` |
|---|---|---|
| Inviting line | "Shri Ashok Yadav & Smt. Nisha Yadav **request the pleasure of your company at the wedding of their son**" | "Ar. Vijay Yadav & Smt. Nirmala Yadav … **of their daughter**" |
| First name shown | Prashasy Yadav (labelled *The groom*) | Garima Yadav (labelled *The bride*) |
| Second name | Garima, with her parents and grandparents | Prashasy, with his parents and grandparents |
| Schedule | 4 events incl. Baraat | 4 events incl. Mehendi |
| Home address | Rabindrapalli, Faizabad Road | Ashiyana, Sector K-1 |
| Footer label | "Groom's side" | "Bride's side" |

The visual design is identical on both sides — same colours, same typography.
Only content changes.

### `ev` — per-guest event access

Every event carries a one-letter code. Pass the letters of the events that guest is
invited to, in any order, with no separators.

**Groom's side**

| Code | Event | When | Where |
|---|---|---|---|
| `e` | Engagement | Sat 5 Dec, 7:00 PM | Ramada |
| `h` | Haldi & Mehendi | Sun 6 Dec, 12:00 PM | Yadav Residence, Rabindrapalli |
| `b` | Baraat | Mon 7 Dec, 6:00 PM ⚠ | Yadav Residence, Rabindrapalli |
| `s` | Shaadi | Mon 7 Dec, 8:00 PM | Ramada |

**Bride's side**

| Code | Event | When | Where |
|---|---|---|---|
| `m` | Mehendi | Fri 4 Dec, 12:00 PM | Yadav Residence, Ashiyana |
| `e` | Engagement | Sat 5 Dec, 7:00 PM | Ramada |
| `h` | Haldi | Sun 6 Dec, 12:00 PM | Yadav Residence, Ashiyana |
| `s` | Shaadi | Mon 7 Dec, 8:00 PM | Ramada |

**The important behaviour:** `ev` filters the addresses too. A guest invited only to
the Shaadi sees only Ramada — the home address never appears. Nobody receives an
address for a function they were not invited to.

**Fallbacks.** Omit `ev` and the guest gets everything. `ev=all` does the same.
If `ev` contains no valid codes for that side, it falls back to all events rather
than showing an empty schedule.

### Link recipes

```
# Close family, everything, bride's side
invitation.html?host=bride&to=Sharma%20Family

# Groom's side, engagement and wedding only
invitation.html?host=groom&to=Verma%20ji&ev=es

# Wedding day only
invitation.html?host=bride&to=Gupta%20Uncle&ev=s

# Groom's side, baraat and wedding
invitation.html?host=groom&to=Office%20Team&ev=bs

# Bride's side, ladies' functions only
invitation.html?host=bride&to=Mausi%20ji&ev=mh

# Your own testing link
invitation.html?host=bride&to=Test&preview=1
```

### Generating links in bulk

Put your guest list in a Google Sheet with columns **A: name**, **B: side**
(`groom`/`bride`), **C: codes** (blank = all), then in D2:

```
="https://yoursite.com/invitation.html?host="&B2&"&to="&ENCODEURL(A2)&IF(C2="","","&ev="&C2)
```

Fill down and you have one personalised link per guest, ready to paste into WhatsApp.

---

## 3. What's on the page

The cover is a full-screen sealed letter. Everything after it is one continuous
scroll with a thin gold thread down the left edge that fills as you scroll, with a
bead lighting up at each section.

**Cover.** Ganesh line and mantra, a hanging board with the guest's name, the wax
seal reading `#Prashasy / Ki / Garima`, and both caricatures standing at the edges,
bobbing gently. Tap the seal and: the seal ignites in a spinning ring of fire with a
shockwave, both characters jump, the screen falls dark, gold light blooms from
above, a maroon envelope rises and the cream card slides up out of it, then the card
takes over the screen. About 3 seconds. Tapping anywhere skips it.

| # | Section | What's in it |
|---|---|---|
| 1 | **The invitation** | Guest badge, the inviting family's line, both names with parents and grandparents, and the date in its own bordered panel. Faint caricature "ghosts" drift behind the names. |
| 2 | **Us, so far** | Photos pegged to a hanging gold thread, dropping in one after another. Swipeable on phone, tap to enlarge in a lightbox. |
| 3 | **The Date** | Gold scratch-off foil hiding the wedding date — drag a finger across ~42% of it and it reveals, with a "reveal it for me" fallback. Live countdown below. |
| 4 | **What to expect** | The guest's events, largest text on the page, with a Directions link per event. |
| 5 | **Where we gather** | One card per address actually used by that guest's events, listing which functions happen there, plus a Get directions button. |
| 6 | **Send a wish** | Name + message, posted to your Google Sheet. Approved wishes appear on the wall below. |

Prashasy and Garima also introduce five of these sections with speech bubbles whose
words pop in one at a time:

| Section | Who | Line |
|---|---|---|
| Us, so far | Garima | *Phone ka poora storage inhi tasveeron ne khaya hai.* |
| The Date | Prashasy | *Zara scratch kijiye. Tareekh andar chhupi hai.* |
| What to expect | Garima | *Naach, khana, phir se khana. Timing yahan hai.* |
| Where we gather | Prashasy | *Address yahan hai. Poochhte-poochhte mat aaiyega.* |
| Send a wish | Garima | *Do line likh dijiye. Sabke saamne padhi jayegi.* |

These are deliberately **count-neutral** — the venue line doesn't say "do jagah"
and the schedule line doesn't say "chaar din", because with `ev` filtering a guest
may see only one address or one event.

Always present: falling marigold petals, gold light streaks over each section, a
music toggle (hidden unless you set `music`), and a share button using the phone's
native share sheet.

---

## 4. Config reference

Everything editable lives in one `CONFIG` object at the top of the `<script>` block
near the bottom of `invitation.html`. You never need to touch the CSS or the logic.

### Top level

| Key | Current value | Notes |
|---|---|---|
| `hashtag` | `"#PrashasyKiGarima"` | Wax seal and footer. Splits on capitals and stacks across lines automatically — short hashtags stay on one line. |
| `defaultHost` | `"groom"` | Used when `?host=` is missing or invalid. |
| `music` | `""` | Path to an audio file, e.g. `"audio/shehnai.mp3"`. Empty hides the music button. Browsers block autoplay until the guest taps the seal, which counts as interaction. |
| `inbox.sheetUrl` | `""` | Your Apps Script `/exec` URL. Empty = falls back to WhatsApp. |
| `inbox.whatsapp` | `"919999999999"` | ⚠ **Placeholder.** Country code, no `+`, no spaces. |
| `inbox.showWall` | `true` | Set false to hide the public wish wall but keep the form. |
| `headline.date` | `"2026-12-07T20:00:00+05:30"` | Drives the scratch card, the date panel and the countdown. |
| `headline.place` | `"ramada"` | Key into `places`. |

### `couple`

Each of `groom` and `bride` has `first`, `full`, `parents`, `grandparents`.

| | Groom | Bride |
|---|---|---|
| Name | Prashasy Yadav | Garima Yadav |
| Parents | Shri Ashok Yadav & Smt. Nisha Yadav | Ar. Vijay Yadav & Smt. Nirmala Yadav |
| Grandparents | Shri Malkhan Singh Yadav & Smt. Shiv Pyari Yadav | Shri Surya Bali Yadav & Smt. Somari Yadav |

On the hosting side, only the grandparents are printed under the name — the parents
are already named in the inviting line just above, so repeating them reads badly.
The other side shows both parents and grandparents.

### `gallery`

An array of `{ photo, cap }`. Add or remove entries freely; the hanging line
resizes. Square crops look best.

| Slot | File | Caption |
|---|---|---|
| 1 | `photos/us-01.jpg` | The first meeting |
| 2 | `photos/us-02.jpg` | Roka |
| 3 | `photos/us-03.jpg` | Both families |
| 4 | `photos/us-04.jpg` | That evening out |
| 5 | `photos/us-05.jpg` | Ring shopping |
| 6 | `photos/us-06.jpg` | Us |

Captions are placeholders — change them to match whatever photos you actually use.

### `places`

Every address is defined once here and referenced by key.

| Key | Name | Address | Used by |
|---|---|---|---|
| `ramada` | Ramada, Lucknow | 404, Junabganj, Lucknow–Kanpur Road, Lucknow 226401 | Engagement, Shaadi (both sides) |
| `groomHome` | Yadav Residence | 16, Hari Nagar, Rabindrapalli, Faizabad Road, Lucknow | Haldi & Mehendi, Baraat |
| `brideHome` | Yadav Residence | 16, Smriti Vihar Colony, Sector K-1, Ashiyana, Lucknow | Mehendi, Haldi |

Each has `tag` (small label above the name), `short` (used in the schedule),
`address`, `maps` (your Google Maps links, already in), and `note` (the italic line
at the bottom of the card).

### `sides`

Each side has `label`, `hosts`, `askLine`, `relA`, `relB`, and an `events` array.
Each event is `{ code, name, start, at }` plus an optional `note`.

`start` must be a full ISO string **with the `+05:30` offset**. That offset is what
makes the times correct for guests abroad — see below.

---

## 5. Times and timezones

Every displayed date and time is formatted through
`Intl.DateTimeFormat` pinned to `Asia/Kolkata`, regardless of what the reader's
phone is set to.

This matters. An earlier version used the device's local timezone, which showed
Mehendi at **6:30 AM** to anyone viewing from the US. Verified fixed against
America/New_York and Europe/London — both render 12:00 PM.

If you add an event, keep the `+05:30` on the end of the `start` string.

---

## 6. Wishes: the Google Sheet

**Setup (~5 minutes)**

1. Create a new Google Sheet.
2. Extensions → Apps Script. Delete the sample, paste in all of `apps-script.gs`, save.
3. Deploy → New deployment → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← must be this, *not* "Anyone with Google account"
4. Authorise. You'll see an "unverified app" warning — it's your own script, so
   Advanced → Go to project.
5. Copy the `/exec` URL into `inbox.sheetUrl` in `invitation.html`.

The **Wishes** tab creates itself on the first submission with columns
`Time · Side · Name · Message · Show on page`.

**Moderation.** "Show on page" defaults to `yes`. Type `no` in any row and that wish
vanishes from the public wall but stays in your sheet. Worth watching, since the
wall is open to anyone with a link.

**Email alerts.** Set `NOTIFY_EMAIL` at the top of the script.

**After any script edit you must redeploy:** Deploy → Manage deployments → pencil
icon → Version: **New version**. Saving alone does nothing.

**Until `sheetUrl` is set**, the form falls back to opening WhatsApp with the wish
pre-typed to `inbox.whatsapp`. Nothing is broken while you set it up.

### Why it's built this way

- Writes go out as a `no-cors` POST, the one request shape that works from a static
  file without CORS configuration.
- Reads come back over **JSONP**, because Apps Script's redirect chain breaks a
  plain `fetch` GET often enough to matter on hotel wifi.

---

## 7. Hosting and sending

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel, or plain
shared hosting. Upload `invitation.html` and the `photos/` folder. There is no
build step and no server code.

**Before you send anything to anyone:**

1. Replace the `og:image` meta tag near the top with a real hosted image path. That
   thumbnail is the first thing anyone sees in a WhatsApp forward.
2. Test on a real phone **inside WhatsApp's in-app browser** — it is stricter than
   Chrome, and it's the browser most of your guests will actually use.
3. Open one link with an empty Sheet to check the wish wall's empty state.
4. Send yourself a groom link and a bride link and read both end to end.

---

## 8. Design tokens

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#150A0E` | Dark section background |
| `--parchment` | `#F7EFE3` | Light section background |
| `--accent` | `#65101F` | Names, headings on parchment, buttons |
| `--accent-2` | `#8E1F33` | Hover states |
| `--gold` | `#B98A32` | Rules, labels, the scroll thread |
| `--gold-deep` | `#8A6220` | Small gold labels on the parchment sections |
| `--gold-soft` | `#EBD49F` | Text on dark, beads, event times |
| `--ch-g` / `--ch-b` | `1` / `.90` | Groom/bride character height ratio |

Type: **Prata** for display, **Cinzel** for letter-spaced labels, **Jost** for
body and UI, **Tiro Devanagari Hindi** for the mantra. All from Google Fonts.

Both sides share one identity by design — you asked for same look, different content.

---

## 9. Still outstanding

Roughly in order of how much they matter.

- [ ] ⚠ **Confirm the baraat time.** Currently 6:00 PM, working back two hours from
      the 8 PM shaadi. Rabindrapalli to Ramada is Faizabad Road to Kanpur Road —
      right across Lucknow, easily an hour on a December evening. The line is marked
      `⚠ CONFIRM THIS TIME` in the config. If the baraat actually assembles near the
      hotel instead, change `at: "groomHome"` to `at: "ramada"` and the venue section
      follows automatically.
- [ ] **Which Ramada?** Two properties share that Junabganj complex. The venue note
      says `⟨Plaza / Convention Centre⟩` — fill it in, or guests will walk into the
      wrong lobby.
- [ ] **Your photos** into `photos/us-01.jpg` … `us-06.jpg`, and fix the captions.
- [ ] **`inbox.whatsapp`** is still `919999999999`.
- [ ] **`og:image`** — the WhatsApp preview thumbnail.
- [ ] **Contact numbers.** These lived in "Plan your days", which you asked me to
      remove, so guests currently have no number to call. Say the word and I'll add
      one contact line per side to the bottom of the venue card.
- [ ] **Music file**, if you want one.
- [ ] Decide whether the bride's side should show a **baraat welcome / swagat** entry
      to mirror the groom's baraat.

---

## 10. Removed on request

Kept here in case you want any of it back — all of it is a small amount of work to
restore.

| Removed | Was |
|---|---|
| Our Story | Four chronological story beats. Replaced by the photo gallery, since it's an arranged match. |
| Attire theme | Dress code text with coloured dots per event |
| Add to Calendar | Generated `.ics` files, per event and all-events |
| Travel cards | By air / by train / hotel block / parking |
| Plan your days | Action cards including the save-contact vCards |
| Are you coming | Full RSVP form with headcount, feeding the same Sheet |
| Written for | A dropdown on the wish form choosing the recipient |

---

## 11. Bugs found and fixed during the build

Recorded so they don't get reintroduced.

| Bug | Cause | Fix |
|---|---|---|
| Event times wrong for overseas guests (Mehendi showed 6:30 AM) | `toLocaleTimeString` used the device timezone | All formatting pinned to `Asia/Kolkata` |
| Caricature height gap far too large | Both sized to equal *width*, but their aspect ratios differ (0.50 vs 0.32), giving 206px vs 323px | Sized by height, with `--ch-b: .94` |
| Petals accumulated into confetti soup | Burst particles were recycled to the top instead of expiring | Only ambient petals recycle; bursts fall off and are removed |
| "Granddaughter of" printed as "Grandson of" on the bride's side | A `.replace()` bound to the wrong string in a concatenation | Rewrote the lineage block |
| Photo pegs invisible | The horizontal scroll container clipped overflow on both axes | Moved the pegs inside the scroll padding |
| Gallery photos wouldn't enlarge | Silently ignored taps when the image file was missing | Now shows "This photo has not been added yet" |
| Envelope card looked blank | Text was centred in the full card height, most of which sits hidden inside the envelope | Content aligned to the top strip |

---

## 12. Troubleshooting

**Times look wrong.** Check the `start` string still ends in `+05:30`.

**Wishes don't save.** Access must be "Anyone", not "Anyone with Google account".
And redeploy with Version: New version after any script edit.

**Wish wall stays empty.** Check the "Show on page" column isn't `no`, and that
`inbox.showWall` is `true`.

**A guest sees the wrong events.** Check the `ev` codes match that side — `m` exists
only on the bride's side, `b` only on the groom's. An unrecognised code is ignored;
if none match, they get everything.

**Photos show empty frames.** Filenames must match `CONFIG.gallery` exactly, case
included, and sit in a `photos/` folder beside the HTML.

**No animations anywhere.** Animations now play regardless of the device's
reduced-motion setting, so this should not happen. If a page is still flat, check the
URL for a leftover `?motion=reduce`.

**A guest wants it to stop moving.** Anyone whose device asks for reduced motion sees
a small line under the tap prompt — *"This page animates. Switch to the calm
version"* — which reloads with `?motion=reduce`. You can also send that parameter
directly to anyone who needs it.

**The opening feels slow.** Tapping anywhere during the sequence skips to the end.
