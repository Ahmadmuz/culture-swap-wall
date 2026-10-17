/* Culture Swap Wall — application logic.
   Demonstration prototype. No network requests, no real accounts, no real
   moderation. Everything is stored locally in this browser so the interface
   can be tested end to end. */
(function () {
  "use strict";

  var CSW = window.CSW;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------- utils */
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function dateLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
  }
  function timeLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  function categoryOf(id) {
    var found = CSW.categories.filter(function (c) { return c.id === id; })[0];
    return found || { id: id, label: id, colour: "cream" };
  }
  // Community submissions have no photograph, so they use an abstract cover
  // for their category rather than borrowing another story's illustration.
  function categoryTile(catId) {
    return "tile-cat-" + categoryOf(catId).id + ".svg";
  }
  function truncate(text, n) {
    var t = String(text || "");
    return t.length > n ? t.slice(0, n - 1).replace(/\s+\S*$/, "") + "\u2026" : t;
  }

  /* ---------------------------------------------------------------- store */
  var KEYS = {
    community: "csw.community",
    saved: "csw.saved",
    bridge: "csw.bridge",
    reports: "csw.reports",
    queue: "csw.queue",
    visits: "csw.visited"
  };
  var memory = {};

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (raw == null) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (err) {
      return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
    }
  }
  function write(key, value) {
    memory[key] = value;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  var state = {
    community: read(KEYS.community, []),
    saved: read(KEYS.saved, []),
    bridge: read(KEYS.bridge, {}),
    reports: read(KEYS.reports, []),
    queue: read(KEYS.queue, CSW.pendingDemo.slice()),
    route: "",
    filters: { q: "", category: "all", region: "all", sort: "curated" },
    submit: null,
    bridgeStep: 1,
    bridgeDraft: {},
    atlasRegion: null,
    modUnlocked: false,
    modTab: "queue"
  };

  function allStories() {
    return CSW.stories.concat(state.community);
  }
  function storyById(id) {
    return allStories().filter(function (s) { return s.id === id; })[0] || null;
  }
  function approvedReports() {
    return state.reports.filter(function (r) { return r.status === "open"; });
  }
  function isSaved(id) { return state.saved.indexOf(id) !== -1; }

  /* ------------------------------------------------------------- chrome */
  var toastTimer = null;
  function toast(message) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove("is-visible"); }, 4200);
  }

  function dialog(title, bodyHtml, actionsHtml) {
    var dlg = $("#dialog");
    if (!dlg) return;
    $("#dialog-title").textContent = title;
    $("#dialog-body").innerHTML = bodyHtml || "";
    $("#dialog-actions").innerHTML = actionsHtml || "";
    if (typeof dlg.showModal === "function") {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.setAttribute("open", "open");
    }
    var focusTarget = $("#dialog-body input, #dialog-body select, #dialog-body textarea, #dialog-actions button");
    if (focusTarget) focusTarget.focus();
  }
  function closeDialog() {
    var dlg = $("#dialog");
    if (!dlg) return;
    if (typeof dlg.close === "function" && dlg.open) dlg.close();
    else dlg.removeAttribute("open");
  }

  function setTitle(pageTitle) {
    document.title = pageTitle ? pageTitle + " \u2014 Culture Swap Wall" : "Culture Swap Wall \u2014 A safe wall for cultural stories";
  }

  function announce(message) {
    var live = $("#live");
    if (live) live.textContent = message;
  }

  /* ------------------------------------------------------------ fragments */
  function storyCard(story) {
    var cat = categoryOf(story.category);
    var saved = isSaved(story.id);
    return (
      '<article class="story-card" data-category="' + esc(story.category) + '">' +
        '<a class="story-card__link" href="#/story/' + esc(story.id) + '">' +
          '<div class="story-card__media">' +
            '<img src="assets/img/' + esc(story.image || categoryTile(story.category)) + '" alt="" width="640" height="420" loading="lazy">' +
            '<span class="demo-flag">Fictional story</span>' +
            '<span class="tag tag--' + esc(cat.colour) + '">' + esc(cat.label) + '</span>' +
          '</div>' +
          '<div class="story-card__body">' +
            '<p class="story-card__meta"><span>' + esc(story.region) + '</span><span aria-hidden="true">\u00b7</span><span>' + esc(story.readingTime || "2 min") + '</span></p>' +
            '<h3>' + esc(story.title) + '</h3>' +
            '<p>' + esc(truncate(story.summary, 118)) + '</p>' +
            '<p class="story-card__author">Shared by ' + esc(story.author) + (story.community ? ' <span class="pill pill--new">Community</span>' : '') + '</p>' +
          '</div>' +
        '</a>' +
        '<button class="save-btn" type="button" data-action="save" data-id="' + esc(story.id) + '" aria-pressed="' + saved + '" aria-label="' + (saved ? "Remove from saved stories: " : "Save story: ") + esc(story.title) + '">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path d="M6 3.75h12a1.25 1.25 0 0 1 1.25 1.25v15.25L12 16.4l-7.25 3.85V5A1.25 1.25 0 0 1 6 3.75Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>' +
        '</button>' +
      '</article>'
    );
  }

  function emptyState(title, body, action) {
    return (
      '<div class="empty">' +
        '<p class="empty__mark" aria-hidden="true">\u25cb</p>' +
        '<h3>' + esc(title) + '</h3>' +
        '<p>' + esc(body) + '</p>' +
        (action || "") +
      '</div>'
    );
  }

  /* ---------------------------------------------------------------- views */
  var views = {};

  views.home = function () {
    var featured = CSW.stories.filter(function (s) { return s.featured; }).slice(0, 3);
    var total = allStories().length;
    return {
      title: "",
      html:
        '<section class="hero">' +
          '<div class="hero__copy">' +
            '<p class="eyebrow">Peacebuilding Challenge 2026 \u00b7 Demonstration prototype</p>' +
            '<h1>A wall of small, specific stories.</h1>' +
            '<p class="lede">Culture Swap Wall is a moderated space where young people share one true detail about their culture \u2014 a recipe, a greeting, a song, a habit \u2014 and learn the story behind someone else\u2019s. Not a feed. A place to slow down.</p>' +
            '<div class="hero__actions">' +
              '<a class="btn btn--primary" href="#/wall">Enter the wall <span aria-hidden="true">\u2192</span></a>' +
              '<a class="btn btn--ghost" href="#/bridge/lemon-cardamom-tea">Try the Culture Bridge</a>' +
            '</div>' +
            '<p class="hero__note">' + total + ' demonstration stories \u00b7 Fictional content for testing \u00b7 Nothing is published publicly</p>' +
          '</div>' +
          '<div class="hero__art" aria-hidden="true">' +
            '<img class="hero__tile hero__tile--1" src="assets/img/tile-tea.svg" alt="" width="300" height="220">' +
            '<img class="hero__tile hero__tile--2" src="assets/img/tile-drum.svg" alt="" width="240" height="200">' +
            '<img class="hero__tile hero__tile--3" src="assets/img/tile-indigo.svg" alt="" width="230" height="210">' +
            '<img class="hero__tile hero__tile--4" src="assets/img/tile-garden.svg" alt="" width="260" height="190">' +
            '<div class="hero__badge"><span class="dot"></span>Every story read by a person</div>' +
          '</div>' +
        '</section>' +

        '<section class="promises" aria-label="How the wall works">' +
          '<div class="promise"><span class="promise__num">01</span><h2>Share with context</h2><p>A story is not a photo with a caption. It explains what the practice means, and what the person sharing it wants you to understand.</p></div>' +
          '<div class="promise"><span class="promise__num">02</span><h2>Ask before assuming</h2><p>Each story names the assumptions it would like you to set aside. The Bridge turns reading into a respectful question or reflection.</p></div>' +
          '<div class="promise"><span class="promise__num">03</span><h2>Moderated by people</h2><p>An automated check catches obvious problems. A trained human reviewer makes the decision. Filters do not understand context.</p></div>' +
        '</section>' +

        '<section class="bridge-band">' +
          '<div class="bridge-band__intro">' +
            '<p class="eyebrow">The distinctive idea</p>' +
            '<h2>The Culture Bridge</h2>' +
            '<p>Most platforms stop at exposure. The Bridge adds two steps: understanding the context, then connecting through a respectful question, a reflection or a thank-you note. It is the part of the project that turns scrolling into learning.</p>' +
            '<a class="link-arrow" href="#/about">Why this design \u2192</a>' +
          '</div>' +
          '<ol class="bridge-steps">' +
            '<li><span class="step-num">1</span><h3>Discover</h3><p><em>Action:</em> open a story that is outside your experience.</p><p class="outcome">Outcome: curiosity about a specific practice, not a general label.</p></li>' +
            '<li><span class="step-num">2</span><h3>Understand</h3><p><em>Action:</em> read the context, the meaning and the assumptions.</p><p class="outcome">Outcome: recognition of what you assumed before reading.</p></li>' +
            '<li><span class="step-num">3</span><h3>Connect</h3><p><em>Action:</em> ask a question, write a reflection or send a thank-you note.</p><p class="outcome">Outcome: one respectful exchange with a real person behind the story.</p></li>' +
          '</ol>' +
        '</section>' +

        '<section class="section">' +
          '<div class="section__head"><div><p class="eyebrow">From the wall</p><h2>Stories worth slowing down for</h2></div><a class="link-arrow" href="#/wall">See all ' + allStories().length + ' \u2192</a></div>' +
          '<div class="story-grid">' + featured.map(storyCard).join("") + '</div>' +
        '</section>' +

        '<section class="section split">' +
          '<div>' +
            '<p class="eyebrow">Why a wall, not a feed</p>' +
            '<h2>Designed against the reasons young people stay quiet online</h2>' +
            '<p>The original Design Thinking research identified a specific pattern: many students are curious about other cultures but reluctant to speak about their own, because they have seen cultural difference turned into a joke, a stereotype or a target. A general-purpose feed rewards speed and reaction. That is the opposite of what a nervous first contribution needs.</p>' +
            '<p>Culture Swap Wall responds with structure: one story at a time, context before comment, categories instead of an algorithm, and a human review step before anything appears.</p>' +
            '<ul class="check-list">' +
              '<li>No public follower counts, likes or rankings.</li>' +
              '<li>Stories are reviewed before publication.</li>' +
              '<li>Commenting is replaced by guided questions and reflections.</li>' +
              '<li>Every story can be reported, and reports are reviewed by a person.</li>' +
            '</ul>' +
          '</div>' +
          '<aside class="quote-card">' +
            '<p class="quote-card__text">\u201cThe aim is not to make everyone the same. It is to make difference ordinary enough to ask about.\u201d</p>' +
            '<p class="quote-card__cite">Design principle, project report \u00a79</p>' +
            '<hr>' +
            '<p class="small">This prototype implements the design documented in the project report: the wall, the filters, the Bridge, the submission and review flow, the safety information and the impact framework.</p>' +
            '<a class="link-arrow" href="#/about">Read the project logic \u2192</a>' +
          '</aside>' +
        '</section>' +

        '<section class="cta-band">' +
          '<div><h2>Have one small thing worth sharing?</h2><p>A recipe, a greeting, a song, a rule about chairs. Specific beats impressive.</p></div>' +
          '<a class="btn btn--light" href="#/submit">Submit a story</a>' +
        '</section>'
    };
  };

  views.wall = function () {
    var cats = CSW.categories.map(function (c) {
      var active = state.filters.category === c.id;
      return '<button class="chip' + (active ? " is-active" : "") + '" type="button" data-action="filter-category" data-value="' + esc(c.id) + '" aria-pressed="' + active + '">' + esc(c.label) + '</button>';
    }).join("");
    var regions = CSW.regions.map(function (r) {
      return '<option value="' + esc(r.label) + '"' + (state.filters.region === r.label ? " selected" : "") + '>' + esc(r.label) + '</option>';
    }).join("");
    return {
      title: "Discovery wall",
      html:
        '<section class="page-head">' +
          '<p class="eyebrow">The wall</p>' +
          '<h1>Discovery wall</h1>' +
          '<p class="lede">Every story is one person\u2019s account of something specific. Read the context before you respond. All content here is fictional and exists to demonstrate the interface.</p>' +
        '</section>' +
        '<section class="wall-toolbar" aria-label="Search and filter stories">' +
          '<div class="search">' +
            '<label class="sr-only" for="wall-q">Search stories</label>' +
            '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
            '<input id="wall-q" type="search" placeholder="Search stories, places, foods, greetings\u2026" value="' + esc(state.filters.q) + '" autocomplete="off">' +
          '</div>' +
          '<div class="wall-toolbar__row">' +
            '<div class="chips" role="group" aria-label="Filter by category">' +
              '<button class="chip' + (state.filters.category === "all" ? " is-active" : "") + '" type="button" data-action="filter-category" data-value="all" aria-pressed="' + (state.filters.category === "all") + '">All</button>' + cats +
            '</div>' +
            '<div class="selects">' +
              '<label class="sr-only" for="wall-region">Filter by region</label>' +
              '<select id="wall-region"><option value="all">All regions</option>' + regions + '</select>' +
              '<label class="sr-only" for="wall-sort">Sort stories</label>' +
              '<select id="wall-sort">' +
                '<option value="curated"' + (state.filters.sort === "curated" ? " selected" : "") + '>Curated order</option>' +
                '<option value="az"' + (state.filters.sort === "az" ? " selected" : "") + '>A\u2013Z</option>' +
                '<option value="category"' + (state.filters.sort === "category" ? " selected" : "") + '>By category</option>' +
              '</select>' +
              '<button class="btn btn--ghost btn--sm" type="button" data-action="clear-filters">Reset</button>' +
            '</div>' +
          '</div>' +
        '</section>' +
        '<p class="result-count" id="result-count" role="status" aria-live="polite"></p>' +
        '<h2 class="sr-only">Stories on the wall</h2>' +
        '<div id="wall-results" class="story-grid"></div>'
    };
  };

  function filteredStories() {
    var q = state.filters.q.trim().toLowerCase();
    var list = allStories().filter(function (s) {
      if (state.filters.category !== "all" && s.category !== state.filters.category) return false;
      if (state.filters.region !== "all" && s.region !== state.filters.region) return false;
      if (!q) return true;
      var haystack = [s.title, s.summary, s.region, s.author, categoryOf(s.category).label]
        .concat(s.context || []).join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    });
    if (state.filters.sort === "az") {
      list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (state.filters.sort === "category") {
      list.sort(function (a, b) { return categoryOf(a.category).label.localeCompare(categoryOf(b.category).label); });
    }
    return list;
  }

  function renderWallResults() {
    var host = $("#wall-results");
    if (!host) return;
    var list = filteredStories();
    var count = $("#result-count");
    if (count) {
      count.textContent = list.length === 1 ? "1 story matches your filters." : list.length + " stories match your filters.";
    }
    host.innerHTML = list.length
      ? list.map(storyCard).join("")
      : emptyState("No stories match those filters", "Try a different category, clear the region filter, or search for a single word such as \u201ctea\u201d.", '<button class="btn btn--ghost btn--sm" type="button" data-action="clear-filters">Reset filters</button>');
  }

  views.story = function (id) {
    var story = storyById(id);
    if (!story) return views.notFound();
    var cat = categoryOf(story.category);
    var related = allStories().filter(function (s) { return s.id !== story.id && s.category === story.category; }).slice(0, 3);
    var bridgeDone = state.bridge[story.id] && state.bridge[story.id].completed;
    return {
      title: story.title,
      html:
        '<article class="story">' +
          '<a class="back-link" href="#/wall">\u2190 Back to the wall</a>' +
          '<header class="story__head">' +
            '<p class="story__tags"><span class="tag tag--demo">Fictional story</span> <span class="tag tag--' + esc(cat.colour) + '">' + esc(cat.label) + '</span> <span class="tag tag--outline">' + esc(story.region) + '</span>' + (story.community ? ' <span class="pill pill--new">Community submission</span>' : '') + '</p>' +
            '<h1>' + esc(story.title) + '</h1>' +
            '<p class="lede">' + esc(story.summary) + '</p>' +
            '<p class="byline">Shared by <strong>' + esc(story.author) + '</strong> \u00b7 ' + esc(story.authorNote || "Demonstration author") + ' \u00b7 ' + esc(story.readingTime || "2 min") + ' read</p>' +
            '<p class="demo-note"><strong>Fictional demonstration story.</strong> This was written for the prototype and is not a real person\u2019s account.</p>' +
          '</header>' +
          '<figure class="story__figure">' +
            '<img src="assets/img/' + esc(story.image || categoryTile(story.category)) + '" alt="Illustration for ' + esc(story.title) + '" width="1200" height="620">' +
            '<figcaption>Illustration, not a photograph of the contributor. Demonstration content.</figcaption>' +
          '</figure>' +
          '<div class="story__layout">' +
            '<div class="story__body">' +
              '<section><h2>Context</h2>' + story.context.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + '</section>' +
              '<section class="pull"><h2>What it means to me</h2><p>' + esc(story.means) + '</p></section>' +
              '<section><h2>What I would like you to understand</h2><p>' + esc(story.understand) + '</p></section>' +
              '<section class="assumption"><h2>Please don\u2019t assume</h2><p>' + esc(story.assumptions) + '</p></section>' +
              '<section><h2>Listen to the greeting</h2>' +
                '<p class="small">A short text-to-speech version of this story\u2019s opening line, provided as an accessibility feature. It uses the browser\u2019s built-in voice, not a recording of the contributor.</p>' +
                '<button class="btn btn--ghost btn--sm" type="button" data-action="speak" data-text="' + esc(story.audioText || story.summary) + '">Play the opening line</button>' +
                '<button class="btn btn--ghost btn--sm" type="button" data-action="stop-speak">Stop</button>' +
              '</section>' +
              '<section class="bridge-invite">' +
                '<p class="eyebrow">' + (bridgeDone ? "Bridge completed" : "Next step") + '</p>' +
                '<h2>' + (bridgeDone ? "You have already crossed this bridge" : "Cross the Culture Bridge") + '</h2>' +
                '<p>' + (bridgeDone ? "You can revisit your question and reflection, or choose another story." : "Reading is the first step. Ask a respectful question or write a reflection to turn this into an exchange.") + '</p>' +
                '<a class="btn btn--primary" href="#/bridge/' + esc(story.id) + '">' + (bridgeDone ? "Review your Bridge" : "Start the Bridge") + ' <span aria-hidden="true">\u2192</span></a>' +
              '</section>' +
            '</div>' +
            '<aside class="story__aside">' +
              '<div class="aside-card">' +
                '<h2 class="h-sm">Keep this story</h2>' +
                '<button class="btn btn--ghost btn--block" type="button" data-action="save" data-id="' + esc(story.id) + '" aria-pressed="' + isSaved(story.id) + '">' + (isSaved(story.id) ? "Saved \u2713" : "Save to my wall") + '</button>' +
                '<button class="btn btn--ghost btn--block" type="button" data-action="report" data-id="' + esc(story.id) + '">Report this story</button>' +
                '<p class="small">Reports go to the moderation queue in this demonstration. Nothing is sent anywhere.</p>' +
              '</div>' +
              '<div class="aside-card aside-card--soft">' +
                '<h2 class="h-sm">About the contributor</h2>' +
                '<p class="small">' + esc(story.author) + ' shared this as demonstration content for the prototype. In a live version, this space would show only what the contributor chose to publish, with no follower counts or personal details.</p>' +
              '</div>' +
            '</aside>' +
          '</div>' +
          (related.length ? '<section class="section"><div class="section__head"><h2>More in ' + esc(cat.label) + '</h2><a class="link-arrow" href="#/wall">All stories \u2192</a></div><div class="story-grid">' + related.map(storyCard).join("") + '</div></section>' : "") +
        '</article>'
    };
  };

  views.bridge = function (id) {
    var story = storyById(id);
    if (!story) return views.notFound();
    var step = state.bridgeStep;
    var existing = state.bridge[story.id] || {};
    var draft = state.bridgeDraft;
    var steps = ["Question", "Reflection", "Connection"];
    var progress = steps.map(function (label, i) {
      var n = i + 1;
      var cls = step === n ? "is-current" : step > n ? "is-done" : "";
      return '<li class="' + cls + '"' + (step === n ? ' aria-current="step"' : '') + '><span>' + (step > n ? "\u2713" : n) + '</span>' + label + '</li>';
    }).join("");

    var body = "";
    if (step === 1) {
      body =
        '<p class="bridge-story">You are responding to <strong>' + esc(story.title) + '</strong> by ' + esc(story.author) + '.</p>' +
        '<h2>Ask one respectful question</h2>' +
        '<p>A good question is specific, open and does not ask someone to explain their whole culture. Choose a starting point or write your own.</p>' +
        '<div class="chips chips--wrap" role="group" aria-label="Question starters">' +
          story.questions.map(function (q, i) {
            return '<button class="chip chip--starter" type="button" data-action="use-prompt" data-field="question" data-text="' + esc(q) + '">' + esc(q) + '</button>';
          }).join("") +
        '</div>' +
        '<div class="field">' +
          '<label for="bridge-question">Your question</label>' +
          '<textarea id="bridge-question" rows="4" maxlength="400" placeholder="I noticed\u2026 and I wondered\u2026">' + esc(draft.question || existing.question || "") + '</textarea>' +
          '<p class="field__hint"><span id="q-count">0</span>/400 characters. Questions are held in this browser only.</p>' +
        '</div>' +
        '<div class="bridge-nav"><a class="btn btn--ghost" href="#/story/' + esc(story.id) + '">\u2190 Back to the story</a><button class="btn btn--primary" type="button" data-action="bridge-next" data-step="2">Continue to reflection</button></div>';
    } else if (step === 2) {
      body =
        '<p class="bridge-story">' + esc(story.title) + ' \u00b7 ' + esc(story.region) + '</p>' +
        '<h2>Reflect on what changed</h2>' +
        '<p>The Bridge is not a test. It is a record of what you noticed. There is no score and nothing is published.</p>' +
        '<div class="chips chips--wrap" role="group" aria-label="Reflection starters">' +
          story.reflections.map(function (r) {
            return '<button class="chip chip--starter" type="button" data-action="use-prompt" data-field="reflection" data-text="' + esc(r) + '">' + esc(r) + '</button>';
          }).join("") +
        '</div>' +
        '<div class="field">' +
          '<label for="bridge-reflection">Your reflection</label>' +
          '<textarea id="bridge-reflection" rows="6" maxlength="800" placeholder="Before I read this, I assumed\u2026">' + esc(draft.reflection || existing.reflection || "") + '</textarea>' +
          '<p class="field__hint"><span id="r-count">0</span>/800 characters.</p>' +
        '</div>' +
        '<div class="bridge-nav"><button class="btn btn--ghost" type="button" data-action="bridge-back" data-step="1">\u2190 Back</button><button class="btn btn--primary" type="button" data-action="bridge-next" data-step="3">Continue</button></div>';
    } else {
      body =
        '<h2>Close the loop</h2>' +
        '<p>A bridge needs two ends. Choose one small response to send to the contributor. In a live version this would be delivered to their account after moderation; here it is saved locally.</p>' +
        '<div class="field">' +
          '<label for="bridge-thanks">Your message</label>' +
          '<select id="bridge-thanks">' +
            CSW.bridgePrompts.thanks.map(function (t) { return '<option' + ((draft.thanks || (existing && existing.thanks)) === t ? " selected" : "") + '>' + esc(t) + '</option>'; }).join("") +
            '<option>I would rather not send a message.</option>' +
          '</select>' +
          '<p class="field__hint">Messages are limited to short, pre-written options in this prototype so the tone stays respectful.</p>' +
        '</div>' +
        '<div class="bridge-summary">' +
          '<h3>Your Bridge so far</h3>' +
          '<p><strong>Question:</strong> ' + esc(draft.question || existing.question || "Not written yet.") + '</p>' +
          '<p><strong>Reflection:</strong> ' + esc(draft.reflection || existing.reflection || "Not written yet.") + '</p>' +
          '<p class="small">Saving the Bridge keeps it on this device only. It is never sent to a server and cannot be seen by the contributor.</p>' +
        '</div>' +
        '<div class="bridge-nav"><button class="btn btn--ghost" type="button" data-action="bridge-back" data-step="2">\u2190 Back</button><button class="btn btn--primary" type="button" data-action="bridge-finish" data-id="' + esc(story.id) + '">Save my Bridge</button></div>';
    }

    return {
      title: "Culture Bridge \u00b7 " + story.title,
      html:
        '<section class="bridge-page">' +
          '<a class="back-link" href="#/story/' + esc(story.id) + '">\u2190 Back to the story</a>' +
          '<div class="bridge-page__head"><p class="eyebrow">Culture Bridge</p><h1>' + esc(story.title) + '</h1><p class="lede">Three steps: discover, understand, connect. Your answers stay on this device. The story you are responding to is fictional demonstration content.</p></div>' +
          '<ol class="bridge-progress" aria-label="Bridge progress">' + progress + '</ol>' +
          '<div class="bridge-panel">' + body + '</div>' +
          '<p class="small bridge-page__foot">The Bridge is a proposed enhancement in the project report. It is implemented here as a working demonstration of the interaction, not a validated intervention.</p>' +
        '</section>'
    };
  };

  views.atlas = function () {
    var counts = {};
    allStories().forEach(function (s) { counts[s.region] = (counts[s.region] || 0) + 1; });
    var cells = CSW.regions.map(function (r, i) {
      var n = counts[r.label] || 0;
      var active = state.atlasRegion === r.label;
      return '<button class="atlas-cell atlas-cell--' + (i % 4) + (active ? " is-active" : "") + '" type="button" data-action="atlas" data-region="' + esc(r.label) + '" aria-pressed="' + active + '">' +
        '<span class="atlas-cell__dot" aria-hidden="true"></span>' +
        '<span class="atlas-cell__name">' + esc(r.label) + '</span>' +
        '<span class="atlas-cell__count">' + n + ' ' + (n === 1 ? "story" : "stories") + '</span>' +
      '</button>';
    }).join("");

    var detail = "";
    if (state.atlasRegion) {
      var list = allStories().filter(function (s) { return s.region === state.atlasRegion; });
      detail = '<div class="atlas-detail" id="atlas-detail"><h2 tabindex="-1">' + esc(state.atlasRegion) + '</h2>' +
        '<p>' + esc((CSW.regions.filter(function (r) { return r.label === state.atlasRegion; })[0] || {}).note || "") + '</p>' +
        '<div class="story-grid story-grid--compact">' + list.map(storyCard).join("") + '</div></div>';
    }

    return {
      title: "Culture atlas",
      html:
        '<section class="page-head"><p class="eyebrow">Places, not pins</p><h1>Culture atlas</h1>' +
        '<p class="lede">A regional board instead of a geographic map. Precise pins imply that a practice belongs to an exact point on a map, which is rarely true and can expose contributors. This board is fully keyboard accessible and does not ask anyone to locate themselves. Every story shown is fictional demonstration content.</p></section>' +
        '<div class="atlas">' +
          '<div class="atlas-board" role="group" aria-label="Regions with shared stories">' + cells + '</div>' +
          '<div class="atlas-side">' +
            '<div class="aside-card"><h2 class="h-sm">How to read this</h2><p class="small">Each region lists stories shared by people who chose that label themselves. Regions are deliberately broad. A story about one family does not describe everyone in a region, and the interface says so on every story.</p>' +
            '<p class="small">An interactive world map was considered and rejected for the prototype: it adds geographic precision without adding understanding, and it is harder to use with a keyboard or screen reader.</p></div>' +
            '<div class="aside-card aside-card--soft"><h2 class="h-sm">Missing a region?</h2><p class="small">The board only shows regions represented on the wall. Submitting a story adds it.</p><a class="link-arrow" href="#/submit">Submit a story \u2192</a></div>' +
          '</div>' +
        '</div>' +
        detail
    };
  };

  views.submit = function () {
    if (!state.submit) {
      state.submit = { step: 1, data: { title: "", category: "food", region: "Oceania", context: "", means: "", understand: "", assumptions: "", consentOwn: false, consentImage: false, image: "" } };
    }
    var s = state.submit;
    var d = s.data;
    var cats = CSW.categories.map(function (c) { return '<option value="' + esc(c.id) + '"' + (d.category === c.id ? " selected" : "") + '>' + esc(c.label) + '</option>'; }).join("");
    var regions = CSW.regions.map(function (r) { return '<option' + (d.region === r.label ? " selected" : "") + '>' + esc(r.label) + '</option>'; }).join("");
    var steps = ["Write", "Check", "Send"].map(function (label, i) {
      var n = i + 1;
      return '<li class="' + (s.step === n ? "is-current" : s.step > n ? "is-done" : "") + '"' + (s.step === n ? ' aria-current="step"' : '') + '><span>' + (s.step > n ? "\u2713" : n) + '</span>' + label + '</li>';
    }).join("");

    var panel = "";
    if (s.step === 1) {
      panel =
        '<form id="submit-form" novalidate>' +
          '<div class="field"><label for="s-title">Story title</label><input id="s-title" name="title" type="text" maxlength="70" required value="' + esc(d.title) + '" placeholder="Something specific, e.g. \u201cThe chair by the door\u201d"><p class="field__hint">Up to 70 characters.</p></div>' +
          '<div class="field-row">' +
            '<div class="field"><label for="s-category">Category</label><select id="s-category" name="category">' + cats + '</select></div>' +
            '<div class="field"><label for="s-region">Region</label><select id="s-region" name="region">' + regions + '</select></div>' +
          '</div>' +
          '<div class="field"><label for="s-context">Context: what happens, and who with?</label><textarea id="s-context" name="context" rows="6" maxlength="1200" required placeholder="Describe the practice in your own words. Two short paragraphs is plenty.">' + esc(d.context) + '</textarea></div>' +
          '<div class="field"><label for="s-means">What it means to you</label><textarea id="s-means" name="means" rows="3" maxlength="300" required>' + esc(d.means) + '</textarea></div>' +
          '<div class="field"><label for="s-understand">What you would like people to understand</label><textarea id="s-understand" name="understand" rows="3" maxlength="300" required>' + esc(d.understand) + '</textarea></div>' +
          '<div class="field"><label for="s-assumptions">Please don\u2019t assume</label><textarea id="s-assumptions" name="assumptions" rows="3" maxlength="300" required placeholder="What is a common misunderstanding about this?">' + esc(d.assumptions) + '</textarea><p class="field__hint">This is the most important field. It is what makes the wall different from a photo feed.</p></div>' +
          '<div class="checks">' +
            '<label class="check"><input type="checkbox" id="s-own"' + (d.consentOwn ? " checked" : "") + '> <span>This story is mine to share, and it describes my own experience or one I have permission to describe.</span></label>' +
            '<label class="check"><input type="checkbox" id="s-image"' + (d.consentImage ? " checked" : "") + '> <span>If I include a photo or audio, I have permission from everyone identifiable in it. <em>(Image upload is not enabled in this prototype.)</em></span></label>' +
          '</div>' +
          '<p class="form-error" id="form-error" role="alert"></p>' +
          '<div class="bridge-nav"><a class="btn btn--ghost" href="#/wall">Cancel</a><button class="btn btn--primary" type="submit">Preview my story \u2192</button></div>' +
        '</form>';
    } else if (s.step === 2) {
      panel =
        '<h2>Read it as a stranger would</h2>' +
        '<p>This is how your story would appear. Check that it does not ask the reader to guess what you mean, and that it does not speak for a whole culture.</p>' +
        '<div class="preview-card">' +
          '<div class="preview-card__media"><img src="assets/img/' + esc(categoryTile(d.category)) + '" alt=""><span class="tag tag--' + esc(categoryOf(d.category).colour) + '">' + esc(categoryOf(d.category).label) + '</span></div>' +
          '<div class="preview-card__body"><p class="story-card__meta">' + esc(d.region) + ' \u00b7 Pending review</p><h3>' + esc(d.title || "Untitled story") + '</h3><p>' + esc(truncate(d.context, 180)) + '</p></div>' +
        '</div>' +
        '<div class="safety-check"><h3>Automatic pre-check</h3><p class="small">A simple keyword check runs locally before a person sees the story. It can only catch obvious problems; it cannot understand context, sarcasm or a slur used inside a quotation.</p><ul id="autocheck" class="check-list check-list--muted"><li>Waiting for the check\u2026</li></ul></div>' +
        '<div class="checks"><label class="check"><input type="checkbox" id="s-truth"' + (state.submit.truth ? " checked" : "") + '> <span>I understand this demonstration does not publish my story, and that in a live version a human moderator would read it before it appeared.</span></label></div>' +
        '<p class="form-error" id="form-error" role="alert"></p>' +
        '<div class="bridge-nav"><button class="btn btn--ghost" type="button" data-action="submit-back">\u2190 Edit</button><button class="btn btn--primary" type="button" data-action="submit-send">Send for review</button></div>';
    } else {
      panel =
        '<div class="success">' +
          '<p class="success__mark" aria-hidden="true">\u2713</p>' +
          '<h2>Queued for human review</h2>' +
          '<p>Your story is now in the demonstration moderation queue on this device. Nothing has been sent to a server and nothing will appear on the public wall automatically.</p>' +
          '<div class="queue-note"><p><strong>What happens next in a live version</strong></p><ol class="numbered"><li>A moderator reads the story against the published guidelines.</li><li>They may ask you to add context, confirm consent, or change a detail.</li><li>If approved, it appears on the wall with your chosen name.</li><li>You can withdraw it at any time.</li></ol></div>' +
          '<div class="hero__actions"><a class="btn btn--primary" href="#/moderation">Open the moderation demo</a><a class="btn btn--ghost" href="#/wall">Back to the wall</a></div>' +
        '</div>';
    }

    return {
      title: "Submit a story",
      html:
        '<section class="page-head"><p class="eyebrow">Contribute</p><h1>Share one small thing</h1>' +
        '<p class="lede">Stories are reviewed by a person before they appear. You do not need to represent anyone but yourself. Specific and ordinary is better than broad and impressive.</p></section>' +
        '<ol class="bridge-progress" aria-label="Submission progress">' + steps + '</ol>' +
        '<div class="submit-layout"><div class="bridge-panel">' + panel + '</div>' +
        '<aside class="submit-aside"><div class="aside-card"><h2 class="h-sm">Before you write</h2><ul class="check-list check-list--muted"><li>One practice, not a summary of a whole culture.</li><li>Your own experience, or one you have permission to describe.</li><li>No identifiable photos of other people without consent.</li><li>No sacred or restricted knowledge that is not yours to share.</li><li>Assume a reader who is curious, not an audience to impress.</li></ul></div>' +
        '<div class="aside-card aside-card--soft"><h2 class="h-sm">This is a prototype</h2><p class="small">Submissions are stored in your browser only. No account, no upload, no email, no moderator. The queue exists so the workflow can be tested honestly.</p></div></aside></div>'
    };
  };

  views.safety = function () {
    var open = approvedReports().length;
    return {
      title: "Safety and moderation",
      html:
        '<section class="page-head"><p class="eyebrow">Safety</p><h1>Safety, moderation and the limits of both</h1>' +
        '<p class="lede">A wall for cultural stories only works if people trust it. That trust has to be built from concrete rules, visible moderation and an honest account of what the platform cannot guarantee.</p></section>' +
        '<div class="prose-layout"><div class="prose">' +
          '<h2>How a story reaches the wall</h2>' +
          '<ol class="flow-list">' +
            '<li><strong>Submit.</strong> The contributor writes the story and confirms consent.</li>' +
            '<li><strong>Automated pre-check.</strong> A keyword and link check flags obvious risks. It does not decide.</li>' +
            '<li><strong>Human review.</strong> A moderator reads for context, consent, cultural accuracy and tone.</li>' +
            '<li><strong>Decision.</strong> Approved, returned for changes, or declined with a reason.</li>' +
            '<li><strong>Ongoing review.</strong> Readers can report a story at any time, and reports return to a person.</li>' +
          '</ol>' +
          '<div class="callout"><p><strong>Automated filters are not moderation.</strong> Word lists miss context, sarcasm, coded language and images, and they over-block ordinary discussion of racism or identity. In this prototype the filter only surfaces a warning for a human to read. The decision always belongs to a person.</p></div>' +
          '<h2>What a contributor agrees to</h2>' +
          '<ul class="check-list">' +
            '<li>Share your own experience, or one you have explicit permission to describe.</li>' +
            '<li>Do not publish identifiable images or audio of other people without their consent.</li>' +
            '<li>Do not share restricted, sacred or initiation knowledge that is not yours to share.</li>' +
            '<li>Do not present one family\u2019s practice as the practice of a whole country, religion or ethnic group.</li>' +
            '<li>Accept that a moderator may ask for changes, and that decisions can be appealed.</li>' +
          '</ul>' +
          '<h2>What the platform does not guarantee</h2>' +
          '<p>No moderation system prevents every harmful post, and no website can promise that a young person will not encounter prejudice. What a well-run platform can do is reduce the likelihood, respond quickly when something goes wrong, and be transparent about how decisions are made. Any claim stronger than that would be dishonest.</p>' +
          '<h2>Privacy and data</h2>' +
          '<p>In a live version, the minimum viable data would be a display name, a passwordless sign-in, the story itself and a moderation record. No location tracking, no contact imports, no advertising identifiers. Contributors could withdraw a story and have it removed, and deleted stories would be purged from backups on a published schedule. This prototype stores everything in this browser only and sends nothing anywhere.</p>' +
          '<h2>Accessibility</h2>' +
          '<p>The prototype targets WCAG 2.2 Level AA: keyboard operation for every control, visible focus, text alternatives for images, captions and transcripts for audio, a minimum 4.5:1 contrast ratio for body text, resizable text and reduced-motion support. The culture atlas uses a regional board rather than a geographic map because precise pins are hard to use with a keyboard or screen reader and imply a false precision.</p>' +
          '<h2>First Nations content</h2>' +
          '<p>First Nations cultures are not a single category, and Aboriginal and Torres Strait Islander communities have diverse protocols about images, names and knowledge. A live version would need specific protocols, community review and the ability to mark content as restricted, rather than folding these cultures into a generic \u201cIndigenous\u201d tile. This prototype does not include First Nations stories, because doing so responsibly requires consultation this project has not yet undertaken.</p>' +
          '<h2>Copyright and cultural knowledge</h2>' +
          '<p>Contributors keep ownership of their words. The platform would take a limited licence to display and archive the story, revocable on withdrawal. Recipes and songs can belong to families or communities rather than individuals, which is why the submission form asks contributors to confirm they have permission, not merely that they wrote the text themselves.</p>' +
          '<h2>Report something</h2>' +
          '<p>If a story contains harassment, a stereotype presented as fact, private information or content that is not the contributor\u2019s to share, report it. Reports are reviewed by a person.</p>' +
          '<button class="btn btn--primary" type="button" data-action="report" data-id="">Open the report form</button>' +
          '<p class="small">' + open + ' open report' + (open === 1 ? "" : "s") + ' in this demonstration. The moderation view is password-protected by a visible demo code.</p>' +
        '</div>' +
        '<aside class="prose-aside"><div class="aside-card"><h2 class="h-sm">Safety at a glance</h2><ul class="mini-list"><li><strong>Human review</strong> before publication</li><li><strong>No public comments</strong> \u2014 guided prompts instead</li><li><strong>Report</strong> on every story</li><li><strong>Consent</strong> confirmed at submission</li><li><strong>Withdrawal</strong> at any time</li><li><strong>No follower counts</strong> or rankings</li></ul></div>' +
        '<div class="aside-card aside-card--soft"><h2 class="h-sm">For a teacher or judge</h2><p class="small">The moderation demonstration shows the queue, the automated warning, and the approve/return decision. The code is printed on that page so the workflow can be inspected.</p><a class="link-arrow" href="#/moderation">Open moderation \u2192</a></div></aside></div>'
    };
  };

  views.about = function () {
    return {
      title: "About the project",
      html:
        '<section class="page-head"><p class="eyebrow">Project information</p><h1>About Culture Swap Wall</h1>' +
        '<p class="lede">A Peacebuilding Challenge project built through the Design Thinking process: empathise, define, ideate, prototype, test, improve. This page records what the project claims, what it does not claim, and how it would know whether it worked.</p></section>' +
        '<div class="about-grid">' +
          '<article class="about-card"><p class="eyebrow">The problem</p><h2>Curiosity is not the barrier. Safety is.</h2><p>The project began from a pattern in the Empathise stage: students were interested in other cultures but hesitant to speak about their own. They had seen difference turned into a joke, a stereotype or a target. General social platforms reward speed and reaction, which makes a nervous first contribution harder.</p></article>' +
          '<article class="about-card"><p class="eyebrow">The response</p><h2>A slower, moderated wall</h2><p>One story at a time, with context, meaning, a request not to assume, and a guided next step. Categories and search replace an attention algorithm. A human reads every story before it appears.</p></article>' +
          '<article class="about-card"><p class="eyebrow">The distinctive step</p><h2>The Culture Bridge</h2><p>Discover \u2192 Understand \u2192 Connect. Reading is followed by a respectful question and a reflection, so the interaction ends in an exchange rather than a view count. It is a proposed enhancement, tested here as an interface rather than validated as an intervention.</p></article>' +
          '<article class="about-card"><p class="eyebrow">What was tested</p><h2>One recorded feedback cycle</h2><p>The original document records feedback from Arnold on the prototype, which led to specific changes. No second round of testing is claimed. The prototype here is a later build and has not yet been tested with students.</p></article>' +
        '</div>' +
        '<section class="section">' +
          '<div class="section__head"><div><p class="eyebrow">Evaluation</p><h2>How the project would know it worked</h2></div><span class="pill">Planned, not measured</span></div>' +
          '<div class="table-wrap"><table class="data-table"><caption>Impact framework. No baseline figures exist yet; every indicator below is a plan.</caption>' +
            '<thead><tr><th scope="col">Activity</th><th scope="col">Output</th><th scope="col">Short-term outcome</th><th scope="col">Indicator and method</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>Publish and browse stories</td><td>Stories with context and assumptions</td><td>Recognition that a practice is specific, not generic</td><td>Pre/post response to a scenario; coded reflections</td></tr>' +
              '<tr><td>Complete the Bridge</td><td>One question and one reflection per story</td><td>Greater confidence in asking respectful questions</td><td>Self-report scale plus quality of written question</td></tr>' +
              '<tr><td>Moderation and reporting</td><td>Reviewed stories and resolved reports</td><td>Users perceive the space as safe</td><td>Perceived safety survey; report resolution time</td></tr>' +
              '<tr><td>Accessibility design</td><td>Keyboard and screen-reader operable interface</td><td>Users with disabilities can participate equally</td><td>WCAG 2.2 AA audit; usability tasks with assistive technology</td></tr>' +
            '</tbody>' +
          '</table></div>' +
          '<p class="small">A website cannot be shown to reduce racism. The realistic claim is narrower: it can increase the frequency and quality of one respectful intercultural exchange, and it can be evaluated on that.</p>' +
        '</section>' +
        '<section class="section split">' +
          '<div><p class="eyebrow">Limitations</p><h2>What this prototype is not</h2><ul class="check-list check-list--muted"><li>Not a live service: no accounts, uploads, email or server.</li><li>Not moderated in reality: the queue is a local demonstration.</li><li>Not tested with students in this build.</li><li>Not a representative sample of cultures: eight fictional stories.</li><li>Not a replacement for professional safeguarding or legal review.</li></ul></div>' +
          '<div class="aside-card aside-card--soft"><p class="eyebrow">Project report</p><h2 class="h-sm">The document behind this site</h2><p class="small">The report sets out the research, the Design Thinking process, the feature-selection matrix, the safety workflow, the implementation plan and the evaluation framework. This website implements the design decisions recorded there.</p><a class="btn btn--ghost btn--sm" href="assets/docs/Culture_Swap_Wall_Project_Report.pdf" download>Download the report (PDF)</a></div>' +
        '</section>'
    };
  };

  views.saved = function () {
    var list = allStories().filter(function (s) { return isSaved(s.id); });
    return {
      title: "Saved stories",
      html:
        '<section class="page-head"><p class="eyebrow">Your collection</p><h1>Saved stories</h1><p class="lede">Kept in this browser only. Nothing is synced or shared.</p></section>' +
        (list.length ? '<h2 class="sr-only">Your saved stories</h2><div class="story-grid">' + list.map(storyCard).join("") + '</div>' : emptyState("Nothing saved yet", "Use the bookmark on any story to keep it here.", '<a class="btn btn--primary btn--sm" href="#/wall">Browse the wall</a>'))
    };
  };

  views.moderation = function () {
    if (!state.modUnlocked) {
      return {
        title: "Moderation demo",
        html:
          '<section class="page-head"><p class="eyebrow">Restricted demonstration</p><h1>Moderation queue</h1>' +
          '<p class="lede">This view shows how a human reviewer would handle submissions and reports. It is protected by a code that is deliberately visible, because this is a demonstration and not a security boundary.</p></section>' +
          '<div class="mod-lock"><form id="mod-form"><label for="mod-code">Demo access code</label><div class="mod-lock__row"><input id="mod-code" type="text" autocomplete="off" placeholder="Enter code"><button class="btn btn--primary" type="submit">Unlock</button></div><p class="field__hint">The code is <code>wall2026</code>.</p><p class="form-error" id="mod-error" role="alert"></p></form></div>'
      };
    }
    var queue = state.queue.filter(function (q) { return q.status === "pending"; });
    var reports = state.reports;
    var tab = state.modTab;
    var content = "";
    if (tab === "queue") {
      content = queue.length ? queue.map(function (item) {
        return '<article class="mod-card">' +
          '<div class="mod-card__head"><div><p class="story-card__meta">' + esc(categoryOf(item.category).label) + ' \u00b7 ' + esc(item.region) + ' \u00b7 ' + dateLabel(item.submitted) + ' ' + timeLabel(item.submitted) + '</p><h2>' + esc(item.title) + '</h2><p class="small">Submitted by ' + esc(item.author) + '</p></div><span class="pill pill--warn">Pending</span></div>' +
          '<p>' + esc(item.summary) + '</p>' +
          '<ul class="flag-list">' + (item.flags || []).map(function (f) { return '<li>' + esc(f) + '</li>'; }).join("") + '</ul>' +
          '<div class="mod-card__actions"><button class="btn btn--primary btn--sm" type="button" data-action="mod-approve" data-id="' + esc(item.id) + '">Approve and publish</button><button class="btn btn--ghost btn--sm" type="button" data-action="mod-return" data-id="' + esc(item.id) + '">Return for changes</button></div>' +
        '</article>';
      }).join("") : emptyState("The queue is clear", "New submissions from the submission form will appear here.", "");
    } else if (tab === "reports") {
      content = reports.length ? reports.map(function (r) {
        return '<article class="mod-card"><div class="mod-card__head"><div><p class="story-card__meta">' + esc(r.reason) + ' \u00b7 ' + dateLabel(r.created) + '</p><h2>' + esc(r.storyTitle || "General report") + '</h2><p class="small">' + esc(r.details || "No additional details.") + '</p></div><span class="pill pill--warn">' + esc(r.status) + '</span></div>' +
          '<div class="mod-card__actions"><button class="btn btn--primary btn--sm" type="button" data-action="mod-resolve" data-id="' + esc(r.id) + '">Mark resolved</button></div></article>';
      }).join("") : emptyState("No open reports", "Reports submitted from a story page or the safety page appear here.", "");
    } else {
      content = '<div class="aside-card"><h2 class="h-sm">Decision log</h2><p class="small">In a live version every decision would record the reviewer, the reason, the timestamp and the contributor\u2019s response. This prototype keeps no such log, because it is not a real service.</p></div>';
    }

    return {
      title: "Moderation demo",
      html:
        '<section class="page-head"><p class="eyebrow">Restricted demonstration</p><h1>Moderation queue</h1>' +
        '<p class="lede">A human reviewer reads every submission. The automated check below is advisory only.</p></section>' +
        '<div class="mod-bar"><div class="tabs" role="group" aria-label="Moderation sections">' +
          '<button aria-pressed="' + (tab === "queue") + '" class="' + (tab === "queue" ? "is-active" : "") + '" type="button" data-action="mod-tab" data-tab="queue">Queue <span class="count">' + queue.length + '</span></button>' +
          '<button aria-pressed="' + (tab === "reports") + '" class="' + (tab === "reports" ? "is-active" : "") + '" type="button" data-action="mod-tab" data-tab="reports">Reports <span class="count">' + reports.filter(function (r) { return r.status === "open"; }).length + '</span></button>' +
          '<button aria-pressed="' + (tab === "log") + '" class="' + (tab === "log" ? "is-active" : "") + '" type="button" data-action="mod-tab" data-tab="log">About this view</button>' +
        '</div><button class="btn btn--ghost btn--sm" type="button" data-action="mod-lock">Lock</button></div>' +
        '<div class="mod-list">' + content + '</div>'
    };
  };

  views.notFound = function () {
    return {
      title: "Page not found",
      html: '<section class="page-head"><p class="eyebrow">404</p><h1>That page is not on the wall</h1><p class="lede">The link may be out of date. The wall is a good place to start again.</p><a class="btn btn--primary" href="#/wall">Back to the wall</a></section>'
    };
  };

  /* --------------------------------------------------------------- router */
  function parseRoute() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) return { view: "home" };
    var parts = hash.split("/").filter(Boolean);
    return { view: parts[0], id: parts[1] };
  }

  var firstRender = true;

  function render() {
    var route = parseRoute();
    state.route = route.view;
    var view = views[route.view] || views.notFound;
    var result = view(route.id) || views.notFound();
    var main = $("#main");
    if (!main) return;
    main.innerHTML = '<div class="wrap">' + result.html + '</div>';
    setTitle(result.title);
    window.scrollTo({ top: 0, behavior: "auto" });
    syncNav(route.view);

    if (route.view === "wall") {
      renderWallResults();
      var input = $("#wall-q");
      if (input && state.filters.q) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
    if (route.view === "bridge") {
      var q = $("#bridge-question");
      if (q) {
        q.addEventListener("input", function () { $("#q-count").textContent = q.value.length; });
        $("#q-count").textContent = q.value.length;
      }
      var r = $("#bridge-reflection");
      if (r) {
        r.addEventListener("input", function () { $("#r-count").textContent = r.value.length; });
        $("#r-count").textContent = r.value.length;
      }
    }
    if (route.view === "submit" && state.submit) {
      if (state.submit.step === 2) runAutoCheck();
    }
    var heading = main.querySelector("h1");
    if (heading) heading.setAttribute("tabindex", "-1");
    // On a first page load, leave focus at the top of the document so the skip
    // link is the first tab stop. On in-page navigation, move focus to the new
    // heading so the change is announced.
    if (!firstRender && heading) heading.focus({ preventScroll: true });
    firstRender = false;
    stopSpeech();
  }

  function syncNav(active) {
    $$("[data-nav]").forEach(function (link) {
      var isActive = link.getAttribute("data-nav") === active;
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    var nav = $("#site-nav");
    var toggle = $("#nav-toggle");
    if (nav) nav.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  /* --------------------------------------------------------------- speech */
  function stopSpeech() {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (err) { /* ignore */ }
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) {
      toast("This browser does not support read-aloud audio.");
      return;
    }
    stopSpeech();
    var utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.lang = document.documentElement.lang || "en-AU";
    window.speechSynthesis.speak(utterance);
    toast("Reading the story aloud. Press Stop to end.");
  }

  /* ------------------------------------------------------------ validation */
  var FLAG_WORDS = ["idiot", "stupid", "hate", "kill", "ugly", "disgusting", "terrorist", "primitive", "backward"];
  function autoCheck(d) {
    var text = [d.title, d.context, d.means, d.understand, d.assumptions].join(" ").toLowerCase();
    var hits = FLAG_WORDS.filter(function (w) { return text.indexOf(w) !== -1; });
    var results = [];
    results.push({ ok: true, text: "Length and required fields complete." });
    results.push(hits.length
      ? { ok: false, text: "Possible problem language flagged for human review: \u201c" + hits.join("\u201d, \u201c") + "\u201d. This may be a quotation or a discussion of racism, which is why a person decides." }
      : { ok: true, text: "No problem language detected by the keyword list. This does not mean the story is appropriate." });
    results.push(d.assumptions && d.assumptions.length > 20
      ? { ok: true, text: "A \u2018please don\u2019t assume\u2019 note is present." }
      : { ok: false, text: "The \u2018please don\u2019t assume\u2019 note is short. A moderator would ask for more." });
    return results;
  }
  function runAutoCheck() {
    var host = $("#autocheck");
    if (!host || !state.submit) return;
    var results = autoCheck(state.submit.data);
    host.innerHTML = results.map(function (r) {
      return '<li class="' + (r.ok ? "ok" : "warn") + '">' + esc(r.text) + '</li>';
    }).join("");
  }

  /* ---------------------------------------------------------------- events */
  function collectSubmitForm() {
    var d = state.submit.data;
    d.title = ($("#s-title") || {}).value || d.title;
    d.category = ($("#s-category") || {}).value || d.category;
    d.region = ($("#s-region") || {}).value || d.region;
    d.context = ($("#s-context") || {}).value || d.context;
    d.means = ($("#s-means") || {}).value || d.means;
    d.understand = ($("#s-understand") || {}).value || d.understand;
    d.assumptions = ($("#s-assumptions") || {}).value || d.assumptions;
    d.consentOwn = !!($("#s-own") && $("#s-own").checked);
    d.consentImage = !!($("#s-image") && $("#s-image").checked);
  }

  function openReport(storyId) {
    var story = storyId ? storyById(storyId) : null;
    dialog(
      story ? "Report: " + story.title : "Report a concern",
      '<div class="field"><label for="report-reason">What is the problem?</label><select id="report-reason">' +
        '<option>Harassment or a personal attack</option>' +
        '<option>A stereotype presented as fact</option>' +
        '<option>Private information shared without consent</option>' +
        '<option>Content that is not the contributor\u2019s to share</option>' +
        '<option>Something else</option>' +
      '</select></div>' +
      '<div class="field"><label for="report-details">Anything a reviewer should know (optional)</label><textarea id="report-details" rows="3" maxlength="400"></textarea></div>' +
      '<p class="small">Reports are stored in this browser for the demonstration and are not sent anywhere.</p>',
      '<button class="btn btn--ghost" type="button" data-action="dialog-close">Cancel</button><button class="btn btn--primary" type="button" data-action="report-submit" data-id="' + esc(storyId || "") + '">Submit report</button>'
    );
  }

  function handleAction(action, el) {
    switch (action) {
      case "skip-link": {
        // The site uses hash routing, so the skip link focuses main directly
        // rather than writing "#main" into the URL.
        var mainEl = $("#main");
        if (mainEl) {
          mainEl.focus({ preventScroll: true });
          mainEl.scrollIntoView({ block: "start" });
        }
        break;
      }
      case "save": {
        var id = el.getAttribute("data-id");
        if (isSaved(id)) {
          state.saved = state.saved.filter(function (x) { return x !== id; });
          toast("Removed from your saved stories.");
        } else {
          state.saved.push(id);
          toast("Saved. Find it under Saved in the menu.");
        }
        write(KEYS.saved, state.saved);
        $$('[data-action="save"][data-id="' + id + '"]').forEach(function (btn) {
          var on = isSaved(id);
          btn.setAttribute("aria-pressed", String(on));
          btn.innerHTML = btn.classList.contains("btn") ? (on ? "Saved \u2713" : "Save to my wall") : btn.innerHTML;
        });
        if (state.route === "saved") render();
        break;
      }
      case "filter-category": {
        state.filters.category = el.getAttribute("data-value");
        $$('[data-action="filter-category"]').forEach(function (btn) {
          var on = btn.getAttribute("data-value") === state.filters.category;
          btn.classList.toggle("is-active", on);
          btn.setAttribute("aria-pressed", String(on));
        });
        renderWallResults();
        break;
      }
      case "clear-filters": {
        state.filters = { q: "", category: "all", region: "all", sort: "curated" };
        render();
        announce("Filters reset.");
        break;
      }
      case "report": openReport(el.getAttribute("data-id")); break;
      case "report-submit": {
        var sid = el.getAttribute("data-id");
        var story = sid ? storyById(sid) : null;
        var reason = ($("#report-reason") || {}).value || "Other";
        var details = ($("#report-details") || {}).value || "";
        state.reports.unshift({
          id: uid("report"),
          storyId: sid || "",
          storyTitle: story ? story.title : "General concern",
          reason: reason,
          details: details,
          created: new Date().toISOString(),
          status: "open"
        });
        write(KEYS.reports, state.reports);
        closeDialog();
        toast("Report received. It is now in the moderation queue on this device.");
        if (state.route === "safety") render();
        break;
      }
      case "dialog-close": closeDialog(); break;
      case "speak": speak(el.getAttribute("data-text") || ""); break;
      case "stop-speak": stopSpeech(); toast("Audio stopped."); break;
      case "use-prompt": {
        var field = el.getAttribute("data-field");
        var target = field === "question" ? $("#bridge-question") : $("#bridge-reflection");
        if (target) {
          target.value = el.getAttribute("data-text");
          target.focus();
          target.dispatchEvent(new Event("input"));
        }
        break;
      }
      case "bridge-next": {
        var next = parseInt(el.getAttribute("data-step"), 10);
        var qEl = $("#bridge-question");
        var rEl = $("#bridge-reflection");
        if (next === 2 && qEl) state.bridgeDraft.question = qEl.value.trim();
        if (next === 3 && rEl) state.bridgeDraft.reflection = rEl.value.trim();
        if (next === 3 && (!state.bridgeDraft.reflection || state.bridgeDraft.reflection.length < 15)) {
          toast("Write a sentence or two before continuing.");
          if (rEl) rEl.focus();
          return;
        }
        if (next === 2 && state.bridgeDraft.question && state.bridgeDraft.question.length < 8) {
          toast("A question needs a little more detail.");
          if (qEl) qEl.focus();
          return;
        }
        state.bridgeStep = next;
        render();
        break;
      }
      case "bridge-back": state.bridgeStep = parseInt(el.getAttribute("data-step"), 10); render(); break;
      case "bridge-finish": {
        var bid = el.getAttribute("data-id");
        var thanksEl = $("#bridge-thanks");
        var record = state.bridge[bid] || {};
        record.question = state.bridgeDraft.question || record.question || "";
        record.reflection = state.bridgeDraft.reflection || record.reflection || "";
        record.thanks = thanksEl ? thanksEl.value : "";
        record.completed = true;
        record.updated = new Date().toISOString();
        state.bridge[bid] = record;
        write(KEYS.bridge, state.bridge);
        state.bridgeStep = 1;
        state.bridgeDraft = {};
        toast("Bridge saved on this device.");
        window.location.hash = "#/story/" + bid;
        break;
      }
      case "atlas": {
        var region = el.getAttribute("data-region");
        state.atlasRegion = state.atlasRegion === region ? null : region;
        render();
        var detailHeading = $("#atlas-detail h2");
        if (detailHeading) {
          detailHeading.focus({ preventScroll: true });
          detailHeading.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          var activeCell = $('.atlas-cell[data-region="' + region.replace(/"/g, '\\"') + '"]');
          if (activeCell) activeCell.focus();
        }
        break;
      }
      case "submit-back": if (state.submit) state.submit.step = 1; render(); break;
      case "submit-send": {
        var mark = $("#s-truth");
        if (!mark || !mark.checked) {
          var err = $("#form-error");
          if (err) err.textContent = "Please confirm that you understand this is a demonstration.";
          if (mark) mark.focus();
          return;
        }
        var data = state.submit.data;
        var record = {
          id: uid("story"),
          title: data.title,
          category: data.category,
          region: data.region,
          author: "You (demo contributor)",
          authorNote: "Submitted in this browser",
          summary: truncate(data.means || data.context, 120),
          context: data.context.split(/\n{2,}/).filter(Boolean),
          means: data.means,
          understand: data.understand,
          assumptions: data.assumptions,
          image: categoryTile(data.category),
          readingTime: "2 min",
          community: true,
          submitted: new Date().toISOString(),
          status: "pending"
        };
        state.queue.unshift({
          id: record.id,
          title: record.title,
          category: record.category,
          region: record.region,
          author: record.author,
          summary: record.summary,
          submitted: record.submitted,
          flags: ["Submitted in this browser", "Automated pre-check completed"],
          status: "pending",
          story: record
        });
        write(KEYS.queue, state.queue);
        try { window.sessionStorage.setItem("csw.lastSubmission", JSON.stringify(record)); } catch (e) { /* ignore */ }
        state.submit.step = 3;
        render();
        break;
      }
      case "mod-lock": state.modUnlocked = false; render(); break;
      case "mod-tab": state.modTab = el.getAttribute("data-tab"); render(); break;
      case "mod-approve": {
        var item = state.queue.filter(function (q) { return q.id === el.getAttribute("data-id"); })[0];
        if (!item) return;
        item.status = "approved";
        if (item.story) {
          state.community.unshift(item.story);
          write(KEYS.community, state.community);
        }
        write(KEYS.queue, state.queue);
        toast("Approved. " + (item.story ? "The story is now on the wall." : "Demo story marked approved."));
        render();
        break;
      }
      case "mod-return": {
        var ret = state.queue.filter(function (q) { return q.id === el.getAttribute("data-id"); })[0];
        if (!ret) return;
        ret.status = "returned";
        write(KEYS.queue, state.queue);
        toast("Returned to the contributor with a request for changes.");
        render();
        break;
      }
      case "mod-resolve": {
        var rep = state.reports.filter(function (r) { return r.id === el.getAttribute("data-id"); })[0];
        if (!rep) return;
        rep.status = "resolved";
        write(KEYS.reports, state.reports);
        toast("Report marked resolved.");
        render();
        break;
      }
      default: break;
    }
  }

  function init() {
    document.addEventListener("click", function (event) {
      var el = event.target.closest("[data-action]");
      if (!el) return;
      event.preventDefault();
      handleAction(el.getAttribute("data-action"), el);
    });

    document.addEventListener("change", function (event) {
      var id = event.target.id;
      if (id === "wall-region") { state.filters.region = event.target.value; renderWallResults(); }
      if (id === "wall-sort") { state.filters.sort = event.target.value; renderWallResults(); }
    });

    document.addEventListener("input", function (event) {
      if (event.target.id === "wall-q") {
        state.filters.q = event.target.value;
        renderWallResults();
      }
    });

    document.addEventListener("submit", function (event) {
      if (event.target.id === "submit-form") {
        event.preventDefault();
        collectSubmitForm();
        var d = state.submit.data;
        var missing = [];
        if (d.title.trim().length < 4) missing.push("a title");
        if (d.context.trim().length < 60) missing.push("a longer context section (at least 60 characters)");
        if (d.means.trim().length < 15) missing.push("what the practice means to you");
        if (d.understand.trim().length < 15) missing.push("what you would like people to understand");
        if (d.assumptions.trim().length < 15) missing.push("a \u2018please don\u2019t assume\u2019 note");
        if (!d.consentOwn) missing.push("the consent confirmation");
        var err = $("#form-error");
        if (missing.length) {
          if (err) err.textContent = "Please add " + missing.join(", ") + ".";
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        if (err) err.textContent = "";
        state.submit.step = 2;
        render();
      } else if (event.target.id === "mod-form") {
        event.preventDefault();
        var code = ($("#mod-code") || {}).value || "";
        if (code.trim() === "wall2026") {
          state.modUnlocked = true;
          render();
        } else {
          var merr = $("#mod-error");
          if (merr) merr.textContent = "That code is not correct. The demo code is wall2026.";
        }
      } else if (event.target.id === "report-form") {
        event.preventDefault();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var dlg = $("#dialog");
        if (dlg && dlg.open) closeDialog();
      }
    });

    window.addEventListener("hashchange", render);
    window.addEventListener("beforeunload", stopSpeech);
    render();

    var toggle = $("#nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var nav = $("#site-nav");
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
