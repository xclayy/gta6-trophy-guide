// Leonida Trophy Guide: checklist, roadmap and missable flags for GTA VI's 55 trophies.
// Progress is saved in localStorage; export writes it to a file and import reads it back.
// The app fetches only its own files (data/trophies.json, data/roadmap.json) and makes no network request.
const KEY = 'leonida-trophy-guide-v1';

const SOURCES = {
  pushsquare: { name: 'Push Square — GTA 6 Trophy Guide & Roadmap', url: 'https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap' },
  keengamer: { name: 'KeenGamer — GTA 6 Trophy Guide & Platinum Roadmap', url: 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/' },
  gamesgg: { name: 'games.gg — Complete GTA 6 Trophy List', url: 'https://games.gg/grand-theft-auto-vi/guides/complete-grand-theft-auto-6-trophy-list/' },
  egamers: { name: 'EGamers.io — GTA 6 Trophy List, All 55 Trophies', url: 'https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/' },
  gtazone: { name: 'GTA Zone — GTA 6 Trophy List', url: 'https://gta-zone.com/news/gta-6-trophies-achievements/' },
  gamerblurb: { name: 'GamerBlurb — GTA 6 Achievements Guide', url: 'https://gamerblurb.com/articles/gta-6-achievements-guide' }
};

const KINDS = [
  ['all', 'All kinds'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectible', 'Collectibles'],
  ['activity', 'Activities'],
  ['side', 'Side missions'],
  ['crime', 'Crime & combat'],
  ['money', 'Money'],
  ['exploration', 'Exploration'],
  ['online', 'Online']
];
const KIND_LABEL = Object.fromEntries(KINDS);

const doc = await (await fetch('data/trophies.json')).json();
const roadmapDoc = await (await fetch('data/roadmap.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let state = loadState();

function loadState() {
  const fallback = { earned: [], spoiler: true, kind: 'all', grade: 'all', earnedFilter: 'all', search: '', view: 'checklist' };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return saved ? { ...fallback, ...saved, earned: Array.isArray(saved.earned) ? saved.earned : [] } : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

const earned = new Set(state.earned);
function saveEarned() {
  state.earned = [...earned];
  saveState();
}

const $ = (id) => document.getElementById(id);
const listEl = $('list');
const searchEl = $('search');
const gradeEl = $('grade');
const earnedFilterEl = $('earnedFilter');
const spoilerEl = $('spoiler');
const kindsEl = $('kinds');

function gradeCountsText() {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    counts[t.grade][1] += 1;
    if (earned.has(t.name)) counts[t.grade][0] += 1;
  }
  return Object.entries(counts).map(([g, [e, n]]) => `${e}/${n} ${g}`).join(' · ');
}

function renderProgress() {
  $('earnedCount').textContent = earned.size;
  $('totalCount').textContent = trophies.length;
  $('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  $('gradeCounts').textContent = gradeCountsText();
}

function sourceLinks(t) {
  const wrap = document.createElement('p');
  wrap.className = 'sources';
  wrap.textContent = 'Sources: ';
  t.sources.forEach((key, i) => {
    const s = SOURCES[key];
    if (!s) return;
    if (i > 0) wrap.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    wrap.append(a);
  });
  return wrap;
}

function spoilerHidden(t) {
  return state.spoiler && t.kind === 'story' && !earned.has(t.name);
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.name) ? ' earned' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    renderAll();
  });
  li.append(box);
  const body = document.createElement('div');
  const head = document.createElement('div');
  head.className = 'trophy-head';
  const h = document.createElement('h3');
  h.textContent = t.name;
  head.append(h);
  const grade = document.createElement('span');
  grade.className = `grade ${t.grade}`;
  grade.textContent = t.grade;
  head.append(grade);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABEL[t.kind] ?? t.kind;
  head.append(kindTag);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = '⚠ Possibly missable';
    head.append(m);
  }
  body.append(head);
  if (spoilerHidden(t)) {
    const s = document.createElement('p');
    s.className = 'spoiler-box';
    s.textContent = 'Story trophy — its name, description and guide stay hidden until you earn it. Tick the box when it pops to reveal it. (Turn off “Spoiler-free” above to show all story trophies.)';
    body.append(s);
  } else {
    const desc = document.createElement('p');
    desc.className = 'official';
    desc.textContent = `“${t.description}”`;
    body.append(desc);
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    body.append(guide);
    body.append(sourceLinks(t));
  }
  li.append(body);
  return li;
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedFilter === 'earned' && !earned.has(t.name)) return false;
    if (state.earnedFilter === 'todo' && earned.has(t.name)) return false;
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderKinds() {
  kindsEl.replaceChildren();
  for (const [value, label] of KINDS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kind-chip' + (state.kind === value ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => {
      state.kind = value;
      saveState();
      renderAll();
    });
    kindsEl.append(b);
  }
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  const note = $('emptyNote');
  if (shown.length === 0) {
    note.hidden = false;
    note.textContent = state.kind === 'online'
      ? 'No online trophies: all 55 GTA VI trophies are earned offline in single-player, so this filter is empty on purpose.'
      : 'No trophies match these filters. Clear the search or pick another kind or grade.';
  } else {
    note.hidden = true;
  }
}

function renderRoadmap() {
  $('roadmapIntro').textContent = roadmapDoc.intro;
  const ol = $('roadmap');
  ol.replaceChildren();
  for (const stage of roadmapDoc.stages) {
    const li = document.createElement('li');
    li.className = 'stage';
    const h = document.createElement('h3');
    const n = document.createElement('span');
    n.className = 'stage-n';
    n.textContent = stage.n;
    h.append(n, document.createTextNode(stage.title));
    li.append(h);
    const sum = document.createElement('p');
    sum.textContent = stage.summary;
    li.append(sum);
    const tip = document.createElement('p');
    tip.className = 'tip';
    tip.textContent = stage.tip;
    li.append(tip);
    const ul = document.createElement('ul');
    ul.className = 'stage-trophies';
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const item = document.createElement('li');
      if (earned.has(t.name)) item.className = 'done';
      item.textContent = `${t.name} (${t.grade})${t.missable ? ' — possibly missable' : ''}`;
      ul.append(item);
    }
    li.append(ul);
    ol.append(li);
  }
}

function renderMissable() {
  const wrap = $('missableList');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    wrap.append(trophyCard(t));
  }
}

function setView(view) {
  state.view = view;
  saveState();
  for (const b of document.querySelectorAll('.tab')) {
    b.classList.toggle('active', b.dataset.view === view);
  }
  $('view-checklist').hidden = view !== 'checklist';
  $('view-roadmap').hidden = view !== 'roadmap';
  $('view-missable').hidden = view !== 'missable';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missable') renderMissable();
}

function renderAll() {
  renderProgress();
  renderKinds();
  renderList();
  if (state.view === 'roadmap') renderRoadmap();
  if (state.view === 'missable') renderMissable();
}

for (const b of document.querySelectorAll('.tab')) {
  b.addEventListener('click', () => {
    setView(b.dataset.view);
    history.replaceState(null, '', `#${b.dataset.view}`);
  });
}

searchEl.value = state.search;
gradeEl.value = state.grade;
earnedFilterEl.value = state.earnedFilter;
spoilerEl.checked = state.spoiler;
searchEl.addEventListener('input', () => { state.search = searchEl.value; saveState(); renderList(); });
gradeEl.addEventListener('change', () => { state.grade = gradeEl.value; saveState(); renderList(); });
earnedFilterEl.addEventListener('change', () => { state.earnedFilter = earnedFilterEl.value; saveState(); renderList(); });
spoilerEl.addEventListener('change', () => { state.spoiler = spoilerEl.checked; saveState(); renderAll(); });

$('export').addEventListener('click', () => {
  const data = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
  $('saveState').textContent = `Exported ${earned.size} earned trophies.`;
});

$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const good = names.filter((n) => known.has(n));
    earned.clear();
    for (const n of good) earned.add(n);
    saveEarned();
    renderAll();
    $('saveState').textContent = `Imported ${good.length} earned trophies${names.length - good.length ? ` (${names.length - good.length} unknown names ignored)` : ''}.`;
  } catch {
    $('saveState').textContent = 'Import failed: that file is not a trophy-progress export.';
  }
  e.target.value = '';
});

$('reset').addEventListener('click', () => {
  if (!earned.size) return;
  earned.clear();
  saveEarned();
  renderAll();
  $('saveState').textContent = 'Checklist reset — all trophies unmarked.';
});

// Deep links: #roadmap and #missable open those views; ?search= presets the search box.
const params = new URLSearchParams(location.search);
if (params.get('search')) {
  state.search = params.get('search');
  searchEl.value = state.search;
}
const hashView = location.hash.replace('#', '');
if (['checklist', 'roadmap', 'missable'].includes(hashView)) state.view = hashView;
setView(state.view);
renderAll();
