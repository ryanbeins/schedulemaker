// ═══════════════════════════════════════════════
//  DATA MODEL
// ═══════════════════════════════════════════════
const TIME_SLOTS = [
  { label: '2000-0000', start: '2000', end: '0000', hours: 4 },
  { label: '0000-0400', start: '0000', end: '0400', hours: 4 },
  { label: '0400-0800', start: '0400', end: '0800', hours: 4 },
  { label: '0800-1000', start: '0800', end: '1000', hours: 2 },
  { label: '1000-1200', start: '1000', end: '1200', hours: 2 },
  { label: '1200-1400', start: '1200', end: '1400', hours: 2 },
  { label: '1400-1600', start: '1400', end: '1600', hours: 2 },
  { label: '1600-1800', start: '1600', end: '1800', hours: 2 },
  { label: '1800-2000', start: '1800', end: '2000', hours: 2 },
];
const TOTAL_MINS     = 24 * 60;
const DAY_START_MINS = 20 * 60;

const TASK_COLORS = {
  'Sentry': '#f44336', 'PAC': '#00e5ff', 'VAC': '#00e676', 'PO': '#ff9800',
  'ND': '#ffd54f', 'SIGC': '#ffd54f', 'GC/PO': '#ce93d8',
  'VAC/PAC': '#00e676', 'Custom': '#90caf9',
};

const GROUP_ALLOWED_TASKS = {
  kah:        ['GC/PO', 'Sentry', 'PAC', 'VAC', 'PO', 'VAC/PAC', 'Custom'],
  combatants: ['Sentry', 'PAC', 'VAC', 'PO', 'VAC/PAC', 'Custom'],
  service:    ['PAC', 'VAC', 'PO', 'VAC/PAC', 'Custom'],
  night:      ['ND', 'SIGC', 'PAC', 'Custom'],
};

function allowedTypes(group) {
  return GROUP_ALLOWED_TASKS[group] || Object.keys(TASK_COLORS);
}

function populateTypeDropdown(group, currentType) {
  const sel = document.getElementById('t-type');
  const allowed = allowedTypes(group);
  sel.innerHTML = '';
  allowed.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t; opt.textContent = t;
    if (t === currentType) opt.selected = true;
    sel.appendChild(opt);
  });
  if (!allowed.includes(currentType)) sel.selectedIndex = 0;
}

const WBGT_CLASSES = {
  'WHITE': 'wbgt-white', 'GREEN': 'wbgt-green', 'RED': 'wbgt-red',
  'YELLOW': 'wbgt-yellow', 'BLACK': 'wbgt-black',
};

// ── Multi-day schedule storage ──
// Each day (1/2/3) owns an independent wbgt/groups/personnel/meta set.
// `data` always points at the currently active day's objects (by reference,
// so in-place mutations of data.personnel/etc. write straight through to allDays).
function defaultGroups() {
  return [
    { id: 'kah',        label: 'KEY APPOINTMENT HOLDERS (KAH)' },
    { id: 'combatants', label: 'COMBATANTS (DAY)' },
    { id: 'service',    label: 'SERVICE (DAY)' },
    { id: 'night',      label: 'NIGHT DUTY' },
  ];
}

function defaultWBGT() {
  return {
    '2000': 'WHITE', '0000': 'WHITE', '0400': 'WHITE',
    '0800': 'WHITE', '1000': 'GREEN', '1200': 'RED',
    '1400': 'YELLOW', '1600': 'WHITE', '1800': 'WHITE',
  };
}

const PERSONNEL_TEMPLATE = [
  { name: 'Keene',   role: 'GC', group: 'kah' },
  { name: 'Adlan',   role: 'C1', group: 'combatants' },
  { name: 'Haziq',   role: 'C2', group: 'combatants' },
  { name: 'Aidan',   role: 'C3', group: 'combatants' },
  { name: 'Ivan',    role: 'C4', group: 'combatants' },
  { name: 'Ralph',   role: 'S1', group: 'service' },
  { name: 'Sahil',   role: 'S2', group: 'service' },
  { name: 'Thaqris', role: 'N1', group: 'night' },
  { name: 'Ryan',    role: 'GC', group: 'night' },
  { name: 'Danish',  role: 'N3', group: 'night' },
];

function defaultMeta(dateOffsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + dateOffsetDays);
  return {
    flag0600: '', flag1800: '',
    prowl: '', nightProwl1: '', nightProwl2: '',
    strength: '00 / 00 / 00', svcAvg: 0, notes: [], ignoredViolations: [],
    date: d.toISOString().slice(0, 10),
  };
}

// Blank day: same personnel roster, no tasks yet
function blankDay(dayNum) {
  return {
    wbgt: defaultWBGT(),
    groups: defaultGroups(),
    personnel: PERSONNEL_TEMPLATE.map(p => ({ id: uid(), name: p.name, role: p.role, group: p.group, tasks: [] })),
    meta: defaultMeta(dayNum - 1),
  };
}

// Day 1 ships with a filled-in demo schedule
function demoDay1() {
  return {
    wbgt: defaultWBGT(),
    groups: defaultGroups(),
    personnel: [
      { id: uid(), name: 'Keene', role: 'GC', group: 'kah',
        tasks: [{ id: uid(), type: 'GC/PO', label: 'GC/PO', start: '0800', end: '2000', color: '#ce93d8' }] },
      { id: uid(), name: 'Adlan', role: 'C1', group: 'combatants',
        tasks: [
          { id: uid(), type: 'Sentry', label: 'Sentry 0700-0900', start: '0700', end: '0900', color: '#f44336' },
          { id: uid(), type: 'Sentry', label: 'Sentry 1100-1300', start: '1100', end: '1300', color: '#f44336' },
          { id: uid(), type: 'PAC',    label: 'PAC 1400-1600',    start: '1400', end: '1600', color: '#00e5ff' },
        ]},
      { id: uid(), name: 'Haziq', role: 'C2', group: 'combatants',
        tasks: [
          { id: uid(), type: 'PAC',     label: 'PAC 0900-1000',        start: '0900', end: '1000', color: '#00e5ff' },
          { id: uid(), type: 'VAC',     label: 'VAC 1000-1100',        start: '1000', end: '1100', color: '#00e676' },
          { id: uid(), type: 'VAC',     label: 'VAC 1600-1800',        start: '1600', end: '1800', color: '#00e676' },
          { id: uid(), type: 'VAC/PAC', label: 'VAC/PAC till secured', start: '1800', end: '2000', color: '#00e676' },
        ]},
      { id: uid(), name: 'Aidan', role: 'C3', group: 'combatants',
        tasks: [
          { id: uid(), type: 'VAC',    label: 'VAC 0900-1000',    start: '0900', end: '1000', color: '#00e676' },
          { id: uid(), type: 'PAC',    label: 'PAC 1000-1100',    start: '1000', end: '1100', color: '#00e5ff' },
          { id: uid(), type: 'Sentry', label: 'Sentry 1300-1600', start: '1300', end: '1600', color: '#f44336' },
        ]},
      { id: uid(), name: 'Ivan', role: 'C4', group: 'combatants',
        tasks: [
          { id: uid(), type: 'PAC',    label: 'PAC 0800-0900',    start: '0800', end: '0900', color: '#00e5ff' },
          { id: uid(), type: 'Sentry', label: 'Sentry 0900-1100', start: '0900', end: '1100', color: '#f44336' },
          { id: uid(), type: 'PAC',    label: 'PAC 1100-1200',    start: '1100', end: '1200', color: '#00e5ff' },
          { id: uid(), type: 'Sentry', label: 'Sentry 1600-1800', start: '1600', end: '1800', color: '#f44336' },
        ]},
      { id: uid(), name: 'Ralph', role: 'S1', group: 'service',
        tasks: [
          { id: uid(), type: 'VAC', label: 'VAC 1100-1400', start: '1100', end: '1400', color: '#00e676' },
        ]},
      { id: uid(), name: 'Sahil', role: 'S2', group: 'service',
        tasks: [
          { id: uid(), type: 'VAC', label: 'VAC 0700-0900', start: '0700', end: '0900', color: '#00e676' },
          { id: uid(), type: 'PAC', label: 'PAC 1200-1400', start: '1200', end: '1400', color: '#00e5ff' },
          { id: uid(), type: 'VAC', label: 'VAC 1400-1600', start: '1400', end: '1600', color: '#00e676' },
        ]},
      { id: uid(), name: 'Thaqris', role: 'N1', group: 'night',
        tasks: [
          { id: uid(), type: 'ND', label: 'ND (2000 - 0200)', start: '2000', end: '0200', color: '#ffd54f' },
        ]},
      { id: uid(), name: 'Ryan', role: 'GC', group: 'night',
        tasks: [
          { id: uid(), type: 'SIGC', label: 'SIGC (2000 - 0800)', start: '2000', end: '0800', color: '#ffd54f' },
        ]},
      { id: uid(), name: 'Danish', role: 'N3', group: 'night',
        tasks: [
          { id: uid(), type: 'ND', label: 'ND (0200-0800)', start: '0200', end: '0800', color: '#ffd54f' },
        ]},
    ],
    meta: {
      flag0600: 'Adlan,Sahil,Danish', flag1800: 'Haziq,ZZ,Aidan',
      prowl: 'Adlan,ZZ', nightProwl1: '', nightProwl2: '',
      strength: '02 / 06 / 02', svcAvg: 4.5, notes: [], ignoredViolations: [],
      date: new Date().toISOString().slice(0, 10),
    },
  };
}

let allDays = {
  1: demoDay1(),
  2: blankDay(2),
  3: blankDay(3),
};

let data = { day: 1 };

// Point data.wbgt/groups/personnel/meta at the given day's objects
function applyDayPointers(day) {
  const d = allDays[day];
  data.day       = day;
  data.wbgt      = d.wbgt;
  data.groups    = d.groups;
  data.personnel = d.personnel;
  data.meta      = d.meta;
}
applyDayPointers(1);

// ═══════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════
function uid() { return '_' + Math.random().toString(36).slice(2, 9); }

const LANE_H = window.matchMedia('(pointer: coarse)').matches ? 54 : 42;
const SILENT_STARTS = new Set(['2000', '0000', '0400', '1800']);
function isSilentSlot(slot) { return SILENT_STARTS.has(slot.start); }

// Visual scale: silent slots get 0.5× space, non-silent get 1.5× space
// Morning silent slots (2000–0800) stay squashed; evening 1800–2000 matches non-silent width
const MORNING_SILENT = new Set(['2000', '0000', '0400']);
const VISUAL_SLOT_WEIGHTS = TIME_SLOTS.map(s => MORNING_SILENT.has(s.start) ? 0.40 : 1.60);

const SLOT_BOUNDARIES = (() => {
  const b = [];
  let am = 0, vu = 0;
  for (let i = 0; i < TIME_SLOTS.length; i++) {
    b.push({ am, vu, w: VISUAL_SLOT_WEIGHTS[i] });
    am += TIME_SLOTS[i].hours * 60;
    vu += TIME_SLOTS[i].hours * 60 * VISUAL_SLOT_WEIGHTS[i];
  }
  b.push({ am, vu, w: 0 });
  return b;
})();
const TOTAL_VISUAL_UNITS = SLOT_BOUNDARIES[SLOT_BOUNDARIES.length - 1].vu;

// Keep timeline background gradient in sync with visual weights
(function applyTimelineGradient() {
  const m = (minsToVisualPct(timeToMins('0800'))).toFixed(3) + '%';
  const e = (minsToVisualPct(timeToMins('1800'))).toFixed(3) + '%';
  document.documentElement.style.setProperty('--timeline-morning', m);
  document.documentElement.style.setProperty('--timeline-evening', e);
}());

// Maps actual offset-mins (from DAY_START) → visual % within timeline cell
function minsToVisualPct(mins) {
  if (mins <= 0) return 0;
  if (mins >= TOTAL_MINS) return 100;
  for (let i = 0; i < SLOT_BOUNDARIES.length - 1; i++) {
    const s = SLOT_BOUNDARIES[i], e = SLOT_BOUNDARIES[i + 1];
    if (mins >= s.am && mins <= e.am)
      return ((s.vu + (mins - s.am) * s.w) / TOTAL_VISUAL_UNITS) * 100;
  }
  return 100;
}

// Inverse: visual % → actual offset-mins
function visualPctToMins(pct) {
  if (pct <= 0) return 0;
  if (pct >= 100) return TOTAL_MINS;
  const vu = (pct / 100) * TOTAL_VISUAL_UNITS;
  for (let i = 0; i < SLOT_BOUNDARIES.length - 1; i++) {
    const s = SLOT_BOUNDARIES[i], e = SLOT_BOUNDARIES[i + 1];
    if (vu >= s.vu && vu <= e.vu)
      return s.am + (vu - s.vu) / s.w;
  }
  return TOTAL_MINS;
}

// Resolved color for a task (explicit override → type default → fallback)
function taskColor(color, type) { return color || TASK_COLORS[type] || '#90caf9'; }

// Normalized [startMins, endMins] where endMins > startMins (handles overnight wrap)
function taskBounds(start, end) {
  const s = timeToMins(start);
  let e = timeToMins(end);
  if (e <= s) e += TOTAL_MINS;
  return [s, e];
}

function timeToMins(t) {
  const s = String(t).padStart(4, '0');
  const abs = parseInt(s.slice(0, 2)) * 60 + parseInt(s.slice(2, 4));
  let offset = abs - DAY_START_MINS;
  if (offset < 0) offset += TOTAL_MINS;
  return offset;
}

function taskDurationHrs(task) {
  const [s, e] = taskBounds(task.start, task.end);
  return (e - s) / 60;
}

function totalHours(person) {
  return person.tasks.reduce((acc, t) => acc + taskDurationHrs(t), 0);
}

function calcSvcAvg() {
  const qualifying = data.personnel.filter(p => {
    const h = totalHours(p);
    return h > 0 && h < 10;
  });
  if (!qualifying.length) return 0;
  const sum = qualifying.reduce((acc, p) => acc + totalHours(p), 0);
  return Math.round((sum / qualifying.length) * 100) / 100;
}

function avgHours() {
  const hrs = data.personnel.map(totalHours).filter(h => h > 0);
  if (!hrs.length) return 0;
  return hrs.reduce((a, b) => a + b, 0) / hrs.length;
}

function checkConstraints(person) {
  const issues = [];
  const tasks = [...person.tasks].sort((a, b) => timeToMins(a.start) - timeToMins(b.start));
  for (const t of tasks) {
    const dur = taskDurationHrs(t);
    if (dur > 3.0001) issues.push(`"${t.label}" > 3hrs (${dur.toFixed(1)}h)`);
  }
  for (let i = 0; i < tasks.length - 1; i++) {
    const [, tEnd]   = taskBounds(tasks[i].start, tasks[i].end);
    const [tNext]    = taskBounds(tasks[i + 1].start, tasks[i + 1].end);
    let gap = tNext - tEnd;
    if (gap < 0) gap += TOTAL_MINS;
    if (gap < 60) issues.push(`< 1hr break between "${tasks[i].label}" and "${tasks[i+1].label}" (${gap}min)`);
  }
  return issues;
}

function assignLanes(tasks) {
  const sorted = [...tasks].sort((a, b) => timeToMins(a.start) - timeToMins(b.start));
  const laneEnds = [];
  const assignments = new Map();
  for (const task of sorted) {
    const [s, e] = taskBounds(task.start, task.end);
    let placed = false;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= s) {
        laneEnds[i] = e;
        assignments.set(task.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      assignments.set(task.id, laneEnds.length);
      laneEnds.push(e);
    }
  }
  return { assignments, laneCount: Math.max(1, laneEnds.length) };
}

// ═══════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════

// Column widths — weighted: silent cols squashed, non-silent cols expanded
const TIMELINE_PCT = 86.5;
const COL_WIDTHS = [
  '10%',
  ...TIME_SLOTS.map((s, i) => {
    const vu = s.hours * 60 * VISUAL_SLOT_WEIGHTS[i];
    return (TIMELINE_PCT * vu / TOTAL_VISUAL_UNITS).toFixed(4) + '%';
  }),
  '3.5%',
];

function render() {
  renderHead();
  renderBody();
  saveToStorage();
}

function initColGroup() {
  const table = document.getElementById('schedule-table');
  const cg = document.createElement('colgroup');
  COL_WIDTHS.forEach(w => {
    const col = document.createElement('col');
    col.style.width = w;
    cg.appendChild(col);
  });
  table.insertBefore(cg, table.firstChild);
}

function renderHead() {
  const thead = document.getElementById('table-head');
  thead.innerHTML = '';

  const r1 = thead.insertRow();
  r1.className = 'super-hdr';
  th(r1, '', 1, 1);
  th(r1, 'Silent Hours', 1, 3).classList.add('super-silent');
  th(r1, 'Non-Silent Hours', 1, 5).classList.add('super-nonsilent');
  th(r1, 'Silent Hours', 1, 1).classList.add('super-silent');
  th(r1, 'Total', 1, 1);

  const r2 = thead.insertRow();
  r2.className = 'hdr-top';
  th(r2, `Day ${data.day}`);
  TIME_SLOTS.forEach(s => {
    const isMorn = MORNING_SILENT.has(s.start);
    const cell = th(r2, s.label);
    cell.classList.add(isSilentSlot(s) ? 'col-silent' : 'col-nonsilent');
    if (isMorn) cell.classList.add('col-narrow');
  });
  th(r2, 'Total D2');

  const r3 = thead.insertRow();
  r3.className = 'hdr-wbgt';
  r3.insertCell().textContent = 'WBGT Code';
  TIME_SLOTS.forEach(s => {
    const code = data.wbgt[s.start] || 'WHITE';
    const cell = r3.insertCell();
    cell.textContent = code;
    cell.className = (WBGT_CLASSES[code] || 'wbgt-white') + (isSilentSlot(s) ? ' wbgt-silent-col' : '') + (MORNING_SILENT.has(s.start) ? ' wbgt-narrow' : '');
  });
  r3.insertCell();
}

function th(row, text, rowspan = 1, colspan = 1) {
  const cell = document.createElement('th');
  cell.textContent = text;
  if (rowspan > 1) cell.rowSpan = rowspan;
  if (colspan > 1) cell.colSpan = colspan;
  row.appendChild(cell);
  return cell;
}

function renderBody() {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  // Compute once per render pass — reused by every row and the footer
  const avg             = avgHours();
  const constraintCache = new Map(data.personnel.map(p => [p.id, checkConstraints(p)]));

  data.groups.forEach(group => {
    const gRow = tbody.insertRow();
    gRow.className = 'group-hdr';
    const gCell = gRow.insertCell();
    gCell.colSpan = 11;
    gCell.style.display = 'flex';
    gCell.style.alignItems = 'center';
    gCell.style.gap = '10px';
    const gLabel = document.createElement('span');
    gLabel.textContent = group.label;
    const addBtn = document.createElement('button');
    addBtn.className = 'add-person-btn';
    addBtn.innerHTML = '<span class="add-btn-icon">+</span><span class="add-btn-label">Add</span>';
    addBtn.title = `Add person to ${group.label}`;
    addBtn.onclick = () => openAddPersonModal(group.id);
    gCell.appendChild(gLabel);
    gCell.appendChild(addBtn);

    data.personnel
      .filter(p => p.group === group.id)
      .forEach(person => renderPersonRow(tbody, person, avg, constraintCache));
  });

  renderFooter(tbody, constraintCache);
}

function renderPersonRow(tbody, person, avg, constraintCache) {
  const row = tbody.insertRow();
  row.className = 'person-row' + (person.group === 'night' ? ' night-row' : '');
  row.dataset.personId = person.id;

  const nameCell = row.insertCell();
  nameCell.className = 'name-cell';
  nameCell.textContent = person.role ? `${person.name} (${person.role})` : person.name;
  nameCell.onclick = () => openEditPersonModal(person.id);

  const timeCell = row.insertCell();
  timeCell.colSpan = 9;
  timeCell.className = 'timeline-cell';

  const { assignments, laneCount } = assignLanes(person.tasks);
  const rowH = laneCount * LANE_H;
  timeCell.style.height = rowH + 'px';
  nameCell.style.height = rowH + 'px';
  nameCell.style.lineHeight = rowH + 'px';

  // Build per-slot WBGT-coloured background aligned with SLOT_BOUNDARIES
  const NIGHT_BG = '#1a2535';
  const WBGT_TINT = { WHITE:'#f8fafc', GREEN:'rgba(22,163,74,0.10)', RED:'rgba(220,38,38,0.08)', YELLOW:'rgba(234,179,8,0.10)', BLACK:'rgba(30,41,59,0.18)' };
  const gradStops = [];
  TIME_SLOTS.forEach((slot, i) => {
    const s = (SLOT_BOUNDARIES[i].vu     / TOTAL_VISUAL_UNITS * 100).toFixed(3) + '%';
    const e = (SLOT_BOUNDARIES[i + 1].vu / TOTAL_VISUAL_UNITS * 100).toFixed(3) + '%';
    const isNight = MORNING_SILENT.has(slot.start) || slot.start === '1800';
    const color   = isNight ? NIGHT_BG : (WBGT_TINT[data.wbgt[slot.start] || 'WHITE'] || '#f8fafc');
    gradStops.push(`${color} ${s}`, `${color} ${e}`);
  });
  timeCell.style.background = `linear-gradient(to right,${gradStops.join(',')})`;


  const clickZone = document.createElement('div');
  clickZone.className = 'timeline-click-zone';
  clickZone.title = 'Click to add task';
  clickZone.onclick = (e) => onTimelineClick(e, person.id, timeCell);
  timeCell.appendChild(clickZone);

  // Silent/non-silent boundary markers at 0800 and 1800
  [timeToMins('0800'), timeToMins('1800')].forEach(m => {
    const mk = document.createElement('div');
    mk.className = 'timeline-boundary';
    mk.style.left = minsToVisualPct(m) + '%';
    timeCell.appendChild(mk);
  });

  person.tasks.forEach(task => {
    const bar = document.createElement('div');
    bar.className = 'task-bar';
    const lane = assignments.get(task.id) || 0;
    const [startM, endM] = taskBounds(task.start, task.end);
    bar.style.left   = minsToVisualPct(startM) + '%';
    bar.style.width  = (minsToVisualPct(endM) - minsToVisualPct(startM)) + '%';
    bar.style.top    = (lane * LANE_H + 2) + 'px';
    bar.style.height = (LANE_H - 4) + 'px';
    const color = taskColor(task.color, task.type);
    bar.style.background   = color;
    bar.style.color        = '#000';
    bar.style.flexDirection = 'column';
    bar.style.gap          = '1px';

    const typeSpan = document.createElement('span');
    typeSpan.className   = 'bar-type';
    typeSpan.textContent = task.type === 'Custom' ? (task.label || 'Custom') : task.type;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'bar-time';
    // PAC/VAC/PO (and the combined VAC/PAC type) running to end-of-day read
    // as "till secured" instead of showing the clock times.
    const tillSecured = task.type === 'VAC/PAC'
      || (['PAC', 'VAC', 'PO'].includes(task.type) && task.end === '2000');
    timeSpan.textContent = tillSecured ? 'till secured' : task.start + '–' + task.end;

    bar.appendChild(typeSpan);
    bar.appendChild(timeSpan);
    bar.title = `${task.label}\n${task.start} – ${task.end}\nClick to edit`;

    bar.style.cursor  = 'grab';
    bar.onmousedown   = (e) => startBarDrag(e, person.id, task.id, timeCell);
    bar.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initDragState(e.touches[0].clientX, person.id, task.id, timeCell, bar, false);
    }, { passive: false });
    bar.addEventListener('touchend', () => {
      if (!dragState || dragState.taskId !== task.id) return;
      const wasMoved = dragState.moved;
      handleDragEnd();
      if (!wasMoved) openEditTaskModal(person.id, task.id);
    });
    bar.onmousemove   = (e) => {
      if (dragState) return;
      bar.style.cursor = e.clientX > bar.getBoundingClientRect().right - 10 ? 'ew-resize' : 'grab';
    };
    bar.onclick = (e) => {
      e.stopPropagation();
      if (lastDragMoved) { lastDragMoved = false; return; }
      openEditTaskModal(person.id, task.id);
    };

    const rh = document.createElement('div');
    rh.className    = 'resize-handle';
    rh.title        = 'Drag to resize';
    rh.onmousedown  = (e) => { e.stopPropagation(); startBarDrag(e, person.id, task.id, timeCell); };
    rh.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      initDragState(e.touches[0].clientX, person.id, task.id, timeCell, bar, true);
    }, { passive: false });
    bar.appendChild(rh);

    // Violation badge if task > 3 hrs
    const ignored = (data.meta.ignoredViolations || []).includes(task.id);
    if (taskDurationHrs(task) > 3.0001 && !ignored) {
      bar.classList.add('task-violation');
      const badge = document.createElement('span');
      badge.className = 'task-violation-badge';
      badge.textContent = '⚠';
      badge.title = 'Tap to ignore this alert';
      // Stop bar's touchstart from starting a drag when tapping the badge
      badge.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
      }, { passive: false });
      badge.addEventListener('touchend', (e) => {
        e.stopPropagation();
        e.preventDefault();
        openIgnoreModal(task.id, task.label || task.type);
      }, { passive: false });
      // Desktop click
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        openIgnoreModal(task.id, task.label || task.type);
      });
      bar.appendChild(badge);
    } else if (ignored && taskDurationHrs(task) > 3.0001) {
      // Show a muted "ignored" dot so user knows it was suppressed
      const dot = document.createElement('span');
      dot.className = 'task-ignored-dot';
      dot.title = 'Violation ignored — tap to restore';
      dot.textContent = '✓';
      dot.addEventListener('touchstart', (e) => { e.stopPropagation(); e.preventDefault(); }, { passive: false });
      dot.addEventListener('touchend', (e) => {
        e.stopPropagation(); e.preventDefault();
        data.meta.ignoredViolations = (data.meta.ignoredViolations || []).filter(id => id !== task.id);
        saveToStorage(); render();
      }, { passive: false });
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        data.meta.ignoredViolations = (data.meta.ignoredViolations || []).filter(id => id !== task.id);
        saveToStorage(); render();
      });
      bar.appendChild(dot);
    }

    timeCell.appendChild(bar);
  });

  const issues = constraintCache.get(person.id) || [];
  const ignoredIds = data.meta.ignoredViolations || [];
  const overdueTasks   = person.tasks.filter(t => taskDurationHrs(t) > 3.0001);
  const activeViol     = overdueTasks.filter(t => !ignoredIds.includes(t.id));
  const approvedViol   = overdueTasks.filter(t =>  ignoredIds.includes(t.id));

  if (activeViol.length > 0) {
    nameCell.classList.add('has-violation');
    nameCell.title = '⚠ ' + issues.join(' | ');
  } else if (approvedViol.length > 0) {
    nameCell.classList.add('has-approved');
    nameCell.title = '✓ Violation approved — manpower shortage';
  }

  const hrs    = totalHours(person);
  const d2Cell = row.insertCell();
  d2Cell.className = 'total-cell total-d2';
  d2Cell.textContent = hrs > 0 ? hrs.toFixed(2) : '';
  if (hrs > avg * 3) {
    d2Cell.classList.add('over-avg');
    d2Cell.title = '* Hours exceeded avg by >3×';
  }

}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeProwlSelects(container, metaKey, count = 2, opts = {}) {
  const parts = (data.meta[metaKey] || '').split(',').map(s => s.trim());

  function buildSelect(selectedName) {
    const sel = document.createElement('select');
    sel.className = 'footer-prowl-select';
    const blank = document.createElement('option');
    blank.value = '';
    blank.textContent = '— None —';
    sel.appendChild(blank);
    data.personnel.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.role ? `${p.name} (${p.role})` : p.name;
      if (p.name === selectedName) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }

  const selects = Array.from({ length: count }, (_, i) => buildSelect(parts[i] || ''));
  const save = () => {
    data.meta[metaKey] = selects.map(s => s.value).filter(Boolean).join(',');
    saveToStorage();
  };
  selects.forEach(s => s.addEventListener('change', save));

  const wrap = document.createElement('div');
  wrap.className = 'prowl-selects';
  selects.forEach(s => wrap.appendChild(s));

  if (opts.randomize) {
    const rngBtn = document.createElement('button');
    rngBtn.type = 'button';
    rngBtn.className = 'prowl-rng-btn';
    rngBtn.title = 'Pick randomly';
    rngBtn.setAttribute('aria-label', 'Randomize');
    rngBtn.textContent = '🎲';
    rngBtn.onclick = () => {
      const picks = shuffleArray(data.personnel).slice(0, count).map(p => p.name);
      selects.forEach((s, i) => { s.value = picks[i] || ''; });
      save();
    };
    wrap.appendChild(rngBtn);
  }

  container.appendChild(wrap);
}

function makeFooterEditable(cell, getV, setV, opts = {}) {
  cell.classList.add('footer-editable');
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = getV();
  inp.className = 'footer-editable-input';
  if (opts.textAlign)  inp.style.textAlign = opts.textAlign;
  if (opts.inputMode)  inp.inputMode = opts.inputMode;
  inp.addEventListener('blur', () => { setV(inp.value.trim()); saveToStorage(); inp.value = getV(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { inp.value = getV(); inp.blur(); }
  });
  cell.appendChild(inp);
}

function renderFooter(tbody, constraintCache) {
  const divRow = tbody.insertRow();
  divRow.insertCell().colSpan = 11;
  divRow.cells[0].className = 'footer-divider';

  // === Flag row ===
  const flagRow = tbody.insertRow();
  flagRow.className = 'footer-row footer-flags';
  // 0600 Flag: label cell + selects cell (same pattern as 1800 flag)
  const fl1 = flagRow.insertCell(); fl1.colSpan = 1; fl1.innerHTML = '<b>0600 Flag:</b>'; fl1.style.textAlign = 'right';
  const fc3 = flagRow.insertCell(); fc3.colSpan = 4;
  makeProwlSelects(fc3, 'flag0600', 3, { randomize: true });
  // 1800 flag: label right-aligned, selects next cell
  const fl3 = flagRow.insertCell(); fl3.colSpan = 2;
  fl3.innerHTML = '<b>1800 flag:</b>';
  fl3.style.textAlign = 'right';
  const fc5 = flagRow.insertCell(); fc5.colSpan = 4;
  makeProwlSelects(fc5, 'flag1800', 3, { randomize: true });

  // === Prowl row ===
  const prowlRow = tbody.insertRow();
  prowlRow.className = 'footer-row';
  const cbCell = prowlRow.insertCell();
  cbCell.colSpan = 2;
  cbCell.style.textAlign = 'center';
  cbCell.style.padding = '4px 8px';
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = data.meta.date || new Date().toISOString().slice(0, 10);
  dateInput.className = 'footer-date-input';
  dateInput.onchange = () => { data.meta.date = dateInput.value; saveToStorage(); };
  cbCell.appendChild(dateInput);

  const pr2 = prowlRow.insertCell(); pr2.colSpan = 3;
  pr2.innerHTML = '<b>Morning Prowl:</b><br>';
  makeProwlSelects(pr2, 'prowl');
  const pr4 = prowlRow.insertCell(); pr4.colSpan = 2; pr4.innerHTML = '<b>Total Strength:</b>'; pr4.style.textAlign = 'right';
  const pr6 = prowlRow.insertCell(); pr6.colSpan = 4;

  const strParts = (data.meta.strength || '00 / 00 / 00').split('/').map(p => p.trim());
  const strDiv = document.createElement('div');
  strDiv.className = 'strength-fields';
  ['GC', 'CBT', 'SVC'].forEach((lbl, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'strength-field';
    const label = document.createElement('span');
    label.textContent = lbl;
    label.className = 'strength-label';
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = strParts[i] || '00';
    inp.className = 'footer-editable-input strength-inp';
    inp.inputMode = 'numeric';
    inp.maxLength = 3;
    const save = () => {
      const vals = [...strDiv.querySelectorAll('input')].map(x => x.value.trim() || '00');
      data.meta.strength = vals.join(' / ');
      saveToStorage();
    };
    inp.addEventListener('blur', save);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    wrap.appendChild(label);
    wrap.appendChild(inp);
    strDiv.appendChild(wrap);
  });
  pr6.appendChild(strDiv);

  function makeInlineEditable(parent, metaKey) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = data.meta[metaKey];
    inp.className = 'footer-editable-input inline';
    inp.addEventListener('blur', () => { data.meta[metaKey] = inp.value.trim(); saveToStorage(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    parent.appendChild(inp);
  }

  // 1st Night Prowl + Service Avg on same row
  const nightProwlRow1 = tbody.insertRow();
  nightProwlRow1.className = 'footer-row';
  nightProwlRow1.insertCell().colSpan = 2;
  const np1 = nightProwlRow1.insertCell(); np1.colSpan = 4;
  np1.innerHTML = '<b>1st Night Prowl:</b><br>';
  makeProwlSelects(np1, 'nightProwl1');
  const svc2 = nightProwlRow1.insertCell(); svc2.colSpan = 3;
  svc2.innerHTML = '<b>Service Avg Mounting hrs:</b>';
  svc2.style.cssText = 'text-align:right;vertical-align:middle;';
  const svc3 = nightProwlRow1.insertCell(); svc3.colSpan = 2;
  const computedAvg = calcSvcAvg();
  data.meta.svcAvg = computedAvg;
  svc3.textContent = computedAvg > 0 ? computedAvg.toFixed(2) + ' hrs' : '—';
  svc3.style.cssText = 'text-align:center;font-weight:700;font-size:14px;color:#1d4ed8;vertical-align:middle;';

  const nightProwlRow2 = tbody.insertRow();
  nightProwlRow2.className = 'footer-row';
  nightProwlRow2.insertCell().colSpan = 2;
  const np2 = nightProwlRow2.insertCell(); np2.colSpan = 9;
  np2.innerHTML = '<b>2nd Night Prowl:</b><br>';
  makeProwlSelects(np2, 'nightProwl2');


}

// ═══════════════════════════════════════════════
//  TIMELINE CLICK → ADD TASK
// ═══════════════════════════════════════════════
function onTimelineClick(e, personId, cell) {
  const rect = cell.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width * 100;
  const mins = Math.round(visualPctToMins(pct) / 30) * 30;
  openAddTaskModal(personId, minsToTime(mins), minsToTime(Math.min(mins + 120, TOTAL_MINS)));
}

function minsToTime(mins) {
  const t = (mins + DAY_START_MINS) % TOTAL_MINS;
  return String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0');
}

// ═══════════════════════════════════════════════
//  MODAL HELPERS
// ═══════════════════════════════════════════════
let _editPersonId     = null;
let _editTaskPersonId = null;
let _editTaskId       = null;

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
});

function openAddPersonModal(groupId) {
  _editPersonId = null;
  document.getElementById('modal-person-title').textContent = 'Add Person';
  document.getElementById('p-name').value  = '';
  document.getElementById('p-role').value  = '';
  document.getElementById('p-group').value = groupId || 'combatants';
  document.getElementById('btn-delete-person').style.display = 'none';
  openModal('modal-person');
}

function openEditPersonModal(personId) {
  _editPersonId = personId;
  const p = data.personnel.find(x => x.id === personId);
  document.getElementById('modal-person-title').textContent = 'Edit Person';
  document.getElementById('p-name').value  = p.name;
  document.getElementById('p-role').value  = p.role || '';
  document.getElementById('p-group').value = p.group;
  document.getElementById('btn-delete-person').style.display = 'inline-block';
  openModal('modal-person');
}

function savePerson() {
  const name  = document.getElementById('p-name').value.trim();
  const role  = document.getElementById('p-role').value.trim();
  const group = document.getElementById('p-group').value;
  if (!name) { alert('Name is required'); return; }
  if (_editPersonId) {
    const p = data.personnel.find(x => x.id === _editPersonId);
    p.name = name; p.role = role; p.group = group;
  } else {
    data.personnel.push({ id: uid(), name, role, group, tasks: [] });
  }
  closeModal('modal-person');
  render();
}

function deletePerson() {
  if (!confirm('Delete this person and all their tasks?')) return;
  // Mutate the array in place (not reassign) so it stays the same object
  // referenced by allDays[day].personnel — keeps this day's data isolated
  // from the other two days.
  const idx = data.personnel.findIndex(x => x.id === _editPersonId);
  if (idx !== -1) data.personnel.splice(idx, 1);
  closeModal('modal-person');
  render();
}

function openAddTaskModal(personId, startTime, endTime) {
  _editTaskPersonId = personId;
  _editTaskId = null;
  const p = data.personnel.find(x => x.id === personId);
  const defaultType = allowedTypes(p.group)[0];
  document.getElementById('modal-task-title').textContent = `Add Task — ${p.name}`;
  populateTypeDropdown(p.group, defaultType);
  document.getElementById('t-start').value = startTime || '0800';
  document.getElementById('t-end').value   = endTime   || '1000';
  document.getElementById('t-color').value = taskColor(null, defaultType);
  document.getElementById('btn-delete-task').style.display = 'none';
  document.getElementById('custom-label-wrap').style.display = 'none';
  document.getElementById('t-custom-label').value = '';
  updateTaskColor();
  openModal('modal-task');
}

function openEditTaskModal(personId, taskId) {
  _editTaskPersonId = personId;
  _editTaskId = taskId;
  const p = data.personnel.find(x => x.id === personId);
  const t = p.tasks.find(x => x.id === taskId);
  document.getElementById('modal-task-title').textContent = `Edit Task — ${p.name}`;
  populateTypeDropdown(p.group, t.type);
  document.getElementById('t-start').value = t.start;
  document.getElementById('t-end').value   = t.end;
  document.getElementById('t-color').value = taskColor(t.color, t.type);
  document.getElementById('btn-delete-task').style.display = 'inline-block';
  const isCustom = t.type === 'Custom';
  document.getElementById('custom-label-wrap').style.display = isCustom ? '' : 'none';
  document.getElementById('t-custom-label').value = isCustom ? (t.label || '') : '';
  updateTaskColor();
  openModal('modal-task');
}

function updateTaskColor() {
  const type     = document.getElementById('t-type').value;
  const isCustom = type === 'Custom';
  document.getElementById('custom-label-wrap').style.display = isCustom ? '' : 'none';
  if (!isCustom) document.getElementById('t-color').value = taskColor(null, type);
  document.getElementById('color-preview').style.background = document.getElementById('t-color').value;
}

document.getElementById('t-color').addEventListener('input', () => {
  document.getElementById('color-preview').style.background = document.getElementById('t-color').value;
});

function saveTask() {
  const type        = document.getElementById('t-type').value;
  const start       = document.getElementById('t-start').value.trim().padStart(4, '0');
  const end         = document.getElementById('t-end').value.trim().padStart(4, '0');
  const color       = document.getElementById('t-color').value;
  const customLabel = document.getElementById('t-custom-label').value.trim();

  if (!/^\d{4}$/.test(start) || !/^\d{4}$/.test(end)) {
    alert('Enter valid 4-digit times (HHMM)'); return;
  }
  const p = data.personnel.find(x => x.id === _editTaskPersonId);
  if (!allowedTypes(p.group).includes(type)) {
    alert(`${type} is not allowed for ${p.group} personnel.`); return;
  }
  const label = type === 'Custom' ? (customLabel || type) : `${type} ${start}-${end}`;

  if (_editTaskId) {
    const t = p.tasks.find(x => x.id === _editTaskId);
    t.type = type; t.start = start; t.end = end; t.color = color; t.label = label;
  } else {
    p.tasks.push({ id: uid(), type, label, start, end, color });
  }
  closeModal('modal-task');
  render();
}

function deleteTask() {
  const p = data.personnel.find(x => x.id === _editTaskPersonId);
  p.tasks = p.tasks.filter(x => x.id !== _editTaskId);
  closeModal('modal-task');
  render();
}

function openWBGTModal() {
  const container = document.getElementById('wbgt-fields');
  container.innerHTML = '';
  TIME_SLOTS.forEach(slot => {
    const label = document.createElement('label');
    label.textContent = slot.label;
    const sel = document.createElement('select');
    sel.id = 'wbgt-' + slot.start;
    sel.className = 'wbgt-select';
    ['WHITE', 'GREEN', 'YELLOW', 'RED', 'BLACK'].forEach(code => {
      const opt = document.createElement('option');
      opt.value = code; opt.textContent = code;
      if ((data.wbgt[slot.start] || 'WHITE') === code) opt.selected = true;
      sel.appendChild(opt);
    });
    container.appendChild(label);
    container.appendChild(sel);
  });
  openModal('modal-wbgt');
}

function saveWBGT() {
  TIME_SLOTS.forEach(slot => {
    data.wbgt[slot.start] = document.getElementById('wbgt-' + slot.start).value;
  });
  closeModal('modal-wbgt');
  render();
}

function openMetaModal() {
  document.getElementById('m-flag0600').value = data.meta.flag0600;
  document.getElementById('m-flag1800').value = data.meta.flag1800;
  document.getElementById('m-prowl').value    = data.meta.prowl;
  document.getElementById('m-strength').value = data.meta.strength;
  document.getElementById('m-svc-avg').value  = data.meta.svcAvg;
  openModal('modal-meta');
}

function saveMeta() {
  data.meta.flag0600 = document.getElementById('m-flag0600').value;
  data.meta.flag1800 = document.getElementById('m-flag1800').value;
  data.meta.prowl    = document.getElementById('m-prowl').value;
  data.meta.strength = document.getElementById('m-strength').value;
  data.meta.svcAvg   = parseFloat(document.getElementById('m-svc-avg').value) || 0;
  closeModal('modal-meta');
  render();
}

function setDay(v) {
  applyDayPointers(parseInt(v) || 1);
  updateDayTabsUI();
  render();
}

function updateDayTabsUI() {
  document.querySelectorAll('.day-tab').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.day, 10) === data.day);
  });
}

// Wipe all assigned tasks for the active day only, so its personnel/WBGT
// setup stays put but the schedule itself starts blank again.
function clearDay() {
  if (!confirm(`Clear all tasks for Day ${data.day}? This cannot be undone.`)) return;
  data.personnel.forEach(p => { p.tasks = []; });
  data.meta.ignoredViolations = [];
  render();
}

// ═══════════════════════════════════════════════
//  AUTO-GENERATE (Combatants & Service)
// ═══════════════════════════════════════════════
// Max out every shift at the app's 3hr cap — e.g. Sentry runs a full 3hrs
// before rotating to someone else, rather than short 2hr blocks.
const AUTOGEN_SHIFT_HOURS = 3;

// Each duty type's allowed clock-time window. Generated shifts are clipped
// to these — e.g. Sentry never gets scheduled past 1800.
const TASK_WINDOWS = {
  Sentry: { start: '0700', end: '1800' },
  PAC:    { start: '0800', end: '2000' },
  PO:     { start: '0800', end: '2000' },
  VAC:    { start: '0700', end: '2000' },
};

// The 4 posts that must be staffed every hour they're in-window. Sentry is
// listed first because it's the scarcest (Combatants-only) — filling it
// first each hour keeps a Combatant in reserve for the next Sentry rotation
// instead of the greedy loop accidentally using all 4 up on other duties.
const AUTOGEN_TYPES = ['Sentry', 'PAC', 'VAC', 'PO'];

// Hourly checkpoints across the full 0700–2000 span — every hour within a
// duty's window is checked for coverage and (re)filled if nobody's on post.
const AUTOGEN_HOURS = ['0700','0800','0900','1000','1100','1200','1300','1400','1500','1600','1700','1800','1900'];

// Each person can flag which part of the day they'd rather work — up to 2 of
// Morning/Afternoon/Evening, or "Anything" if they're fully flexible. It's a
// soft preference: the generator tries to honor it but will still use
// someone outside their preferred time if that's the only way to keep a
// post covered.
const AUTOGEN_TIME_OPTIONS = ['anything', 'morning', 'afternoon', 'evening'];

function ensureTimePref(person) {
  if (!Array.isArray(person.timePref)) person.timePref = [];
  return person.timePref;
}

// No preference set, or "Anything" picked, means they're open to any period.
function autogenMatchesTimePref(person, periodKey) {
  const pref = ensureTimePref(person);
  return pref.length === 0 || pref.includes('anything') || pref.includes(periodKey);
}

function toggleTimePref(personId, option) {
  const person = data.personnel.find(p => p.id === personId);
  if (!person) return;
  const pref = ensureTimePref(person);
  const idx  = pref.indexOf(option);

  if (option === 'anything') {
    person.timePref = idx === -1 ? ['anything'] : [];
  } else if (idx !== -1) {
    pref.splice(idx, 1);
  } else {
    const specific = pref.filter(p => p !== 'anything');
    if (specific.length < 2) person.timePref = [...specific, option];
    // else: already at the 2-preference cap — fall through to re-render,
    // which resets this checkbox back to unchecked since nothing changed.
  }
  renderAutogenRows();
}

function hhmmToMinutesOfDay(t) {
  const s = String(t).padStart(4, '0');
  return parseInt(s.slice(0, 2), 10) * 60 + parseInt(s.slice(2, 4), 10);
}
function minutesOfDayToHHMM(m) {
  return String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0');
}
function hourPlus(h, n) {
  return minutesOfDayToHHMM(hhmmToMinutesOfDay(h) + n * 60);
}

// PAC/VAC/PO shifts that run to the end of the day (2000) are labeled
// "till secured" instead of showing the clock times.
function autogenLabel(type, shift) {
  if (['PAC', 'VAC', 'PO'].includes(type) && shift.end === '2000') {
    return `${type} till secured`;
  }
  return `${type} ${shift.start}-${shift.end}`;
}

function autogenPeriodForHour(h) {
  const mins = hhmmToMinutesOfDay(h);
  if (mins < hhmmToMinutesOfDay('1200')) return 'morning';
  if (mins < hhmmToMinutesOfDay('1600')) return 'afternoon';
  return 'evening';
}

// Sentry can only go to Combatants; the other 3 posts can go to either.
function autogenEligiblePool(type) {
  return type === 'Sentry'
    ? data.personnel.filter(p => p.group === 'combatants')
    : data.personnel.filter(p => p.group === 'combatants' || p.group === 'service');
}

function autogenHasServedType(person, type) {
  return person.tasks.some(t => t.type === type);
}

// Is anyone already covering `type` at hour `h`? Checked directly against
// everyone's actual tasks (rather than a single running "covered until"
// timestamp) so it stays correct even when coverage comes from more than one
// place — e.g. Phase 1B's Service VAC turns plus Phase 2's general fill.
function autogenIsHourCovered(type, h) {
  const hm = hhmmToMinutesOfDay(h);
  return data.personnel.some(p =>
    (p.group === 'combatants' || p.group === 'service') &&
    p.tasks.some(t => t.type === type && hhmmToMinutesOfDay(t.start) <= hm && hm < hhmmToMinutesOfDay(t.end))
  );
}

// Round-robin cursor per duty type, so that when candidates are otherwise
// perfectly tied, the post rotates to a different person each time instead
// of always defaulting back to whoever's first in the roster (which is what
// caused some people to get picked for the same post repeatedly while
// others never got a turn).
let autogenRotationCursor = { PAC: 0, VAC: 0, PO: 0 };

// Ranks candidates for one of the 3 shared posts (PAC/VAC/PO — Sentry's
// rotation is decided separately, up front). Whoever's stated time
// preference covers this period goes first; ties then go to fewest hours
// worked, then the round-robin cursor.
function autogenCompare(periodKey, cursor, pool) {
  return (a, b) => {
    const aMatch = autogenMatchesTimePref(a, periodKey) ? 0 : 1;
    const bMatch = autogenMatchesTimePref(b, periodKey) ? 0 : 1;
    if (aMatch !== bMatch) return aMatch - bMatch;
    const hoursDiff = totalHours(a) - totalHours(b);
    if (hoursDiff !== 0) return hoursDiff;
    const ia = pool.indexOf(a), ib = pool.indexOf(b);
    return ((ia - cursor + pool.length) % pool.length) - ((ib - cursor + pool.length) % pool.length);
  };
}

// Finds who should cover `type` starting at hour `h`. Tries the best-ranked
// candidate at the fullest legal shift length first, then shrinks that same
// candidate's shift down (to as little as 1hr) before moving on to the next
// candidate — this is what lets someone plug a post even when their day is
// otherwise tightly booked around their own Sentry commitment, instead of
// leaving a gap.
function autogenFillPost(type, h, periodKey) {
  const win     = TASK_WINDOWS[type];
  const maxEnd  = hourPlus(h, AUTOGEN_SHIFT_HOURS);
  const fullEnd = hhmmToMinutesOfDay(maxEnd) > hhmmToMinutesOfDay(win.end) ? win.end : maxEnd;

  const pool    = autogenEligiblePool(type);
  const cursor  = autogenRotationCursor[type];
  const ordered = [...pool].sort(autogenCompare(periodKey, cursor, pool));

  for (const person of ordered) {
    let end = fullEnd;
    while (hhmmToMinutesOfDay(end) > hhmmToMinutesOfDay(h)) {
      if (canAssign(person, h, end)) {
        autogenRotationCursor[type] = (pool.indexOf(person) + 1) % pool.length;
        return { person, end };
      }
      end = hourPlus(end, -1);
    }
  }
  return null;
}

// If idlest can't take a donor's whole shift, checks every possible hour-
// aligned slice of it (largest first) to see if any fits their calendar —
// not just the head or tail, since the one gap in idlest's day might sit
// right in the middle of the donor's block (blocked on both sides by
// idlest's own other tasks). Returns the slice to give away plus whatever
// the donor keeps before/after it (either piece may be empty), or null if
// no slice of that shift works.
function autogenPartialMove(idlest, task) {
  const startMin = hhmmToMinutesOfDay(task.start);
  const endMin   = hhmmToMinutesOfDay(task.end);

  for (let takeLen = Math.floor((endMin - startMin) / 60) - 1; takeLen >= 1; takeLen--) {
    for (let ws = startMin; ws + takeLen * 60 <= endMin; ws += 60) {
      const we = ws + takeLen * 60;
      const giveStart = minutesOfDayToHHMM(ws);
      const giveEnd   = minutesOfDayToHHMM(we);
      if (canAssign(idlest, giveStart, giveEnd)) {
        return {
          giveStart, giveEnd,
          headStart: task.start, headEnd: giveStart,
          tailStart: giveEnd,    tailEnd: task.end,
        };
      }
    }
  }
  return null;
}

// Evens out total hours after the fact by handing already-scheduled work
// from busier people to the least-busy person — never removes coverage, so
// it can only rebalance workload, never reopen a gap. Sentry shifts are
// never touched, since the main pass already worked hard to make sure every
// Combatant gets one and this shouldn't be allowed to undo that. Tries a
// whole-shift handoff first; if nobody's whole shift fits the idlest
// person's calendar, falls back to trimming just part of one over to them
// (e.g. someone whose day is otherwise fully booked can often still take a
// 1hr sliver off the edge of someone else's block). Stops once everyone's
// within ~2hrs of each other, or once no more safe handoffs exist anywhere.
function autogenRebalance() {
  const pool = data.personnel.filter(p => p.group === 'combatants' || p.group === 'service');
  if (pool.length < 2) return;

  for (let i = 0; i < pool.length * 12; i++) {
    const idlest = pool.reduce((a, b) => (totalHours(b) < totalHours(a) ? b : a));
    const busiestGap = Math.max(...pool.map(p => totalHours(p))) - totalHours(idlest);
    if (busiestGap < 2) break;

    const donors = [...pool].filter(p => p !== idlest).sort((a, b) => totalHours(b) - totalHours(a));
    let moved = false;

    for (const donor of donors) {
      const movable = donor.tasks.find(t =>
        t.type !== 'Sentry' && !t.guaranteed &&
        canAssign(idlest, t.start, t.end) &&
        totalHours(idlest) + taskDurationHrs(t) < totalHours(donor)
      );
      if (!movable) continue;
      donor.tasks = donor.tasks.filter(t => t.id !== movable.id);
      idlest.tasks.push(movable);
      moved = true;
      break;
    }

    if (!moved) {
      outer:
      for (const donor of donors) {
        for (const t of donor.tasks) {
          if (t.type === 'Sentry') continue;
          const split = autogenPartialMove(idlest, t);
          if (!split) continue;
          const givenHrs = taskDurationHrs({ start: split.giveStart, end: split.giveEnd });
          if (totalHours(idlest) + givenHrs >= totalHours(donor) - givenHrs) continue; // wouldn't narrow the gap

          idlest.tasks.push({
            id: uid(), type: t.type,
            label: autogenLabel(t.type, { start: split.giveStart, end: split.giveEnd }),
            start: split.giveStart, end: split.giveEnd,
            color: t.color,
          });

          // Donor keeps whatever's left on either side of the carved-out
          // slice — one piece if it came off an edge, two if it came from
          // the middle, replacing the original shift either way. A
          // guaranteed turn (e.g. Service's guaranteed VAC) stays protected
          // as long as the donor keeps some sliver of it.
          donor.tasks = donor.tasks.filter(x => x.id !== t.id);
          [{ start: split.headStart, end: split.headEnd }, { start: split.tailStart, end: split.tailEnd }]
            .filter(r => hhmmToMinutesOfDay(r.end) > hhmmToMinutesOfDay(r.start))
            .forEach(r => donor.tasks.push({
              id: uid(), type: t.type,
              label: autogenLabel(t.type, { start: r.start, end: r.end }),
              start: r.start, end: r.end,
              color: t.color,
              ...(t.guaranteed ? { guaranteed: true } : {}),
            }));

          moved = true;
          break outer;
        }
      }
    }

    if (!moved) break; // no safe handoff left anywhere — leave the remaining gap as-is
  }
}

function openAutogenModal() {
  document.getElementById('autogen-day-label').textContent = data.day;
  renderAutogenRows();
  document.getElementById('autogen-result').style.display = 'none';
  openModal('modal-generator');
  dismissAutogenCallout(); // they've found it — stop nagging
}

// One-time "generate here" pointer at the Auto-Generate button. Dismissed
// either explicitly (×) or the first time the modal's actually opened;
// remembered in localStorage so it doesn't come back on reload.
const AUTOGEN_CALLOUT_KEY = 'scheduleGen_autogenCalloutDismissed';
function dismissAutogenCallout() {
  localStorage.setItem(AUTOGEN_CALLOUT_KEY, '1');
  const el = document.getElementById('autogen-callout');
  if (el) el.classList.add('hidden');
}
if (localStorage.getItem(AUTOGEN_CALLOUT_KEY)) {
  const el = document.getElementById('autogen-callout');
  if (el) el.classList.add('hidden');
}

function renderAutogenRows() {
  const tbody = document.getElementById('autogen-body');
  const sections = [
    { group: 'combatants', label: 'COMBATANTS' },
    { group: 'service',    label: 'SERVICE' },
  ];

  tbody.innerHTML = sections.map(section => {
    const people = data.personnel.filter(p => p.group === section.group);
    if (!people.length) return '';
    const rows = people.map(person => {
      const pref = ensureTimePref(person);
      const checks = AUTOGEN_TIME_OPTIONS.map(opt => `
        <td style="text-align:center">
          <input type="checkbox" ${pref.includes(opt) ? 'checked' : ''}
                 onchange="toggleTimePref('${person.id}','${opt}')">
        </td>`).join('');
      return `<tr><td>${person.name}${person.role ? ` (${person.role})` : ''}</td>${checks}</tr>`;
    }).join('');
    return `<tr class="group-hdr"><td colspan="${AUTOGEN_TIME_OPTIONS.length + 1}">${section.label}</td></tr>${rows}`;
  }).join('');
}

// A person can take a shift only if it doesn't overlap an existing task and
// leaves at least a 1hr gap either side — this is what keeps every generated
// shift (max 3hrs each) separated by a proper break.
function canAssign(person, start, end) {
  const [sM, eM] = taskBounds(start, end);
  for (const task of person.tasks) {
    const [tS, tE] = taskBounds(task.start, task.end);
    if (sM < tE && eM > tS) return false;
    if (sM >= tE && sM < tE + 60) return false;
    if (eM <= tS && eM + 60 > tS) return false;
  }
  return true;
}

// PHASE 1 — Sentry's rotation is decided as a straight round-robin across
// the whole window before anything else is touched. With N Combatants and
// Sentry's 11hr window splitting into N-ish 3hr slots, this is what
// guarantees everyone gets a turn: deciding Sentry hour-by-hour alongside
// the other 3 posts (the old approach) let whoever happened to be free grab
// it repeatedly, since by the time the last slot rolled around the person
// who "should" get it was often already busy elsewhere for that exact hour.
// Within that rotation, whoever's stated a preference for this slot's time
// of day is tried before the others.
function autogenAssignSentryRotation(gaps) {
  const pool = autogenEligiblePool('Sentry');
  if (!pool.length) return 0;
  const win = TASK_WINDOWS.Sentry;
  let assignedCount = 0;
  let cur = win.start;
  let idx = 0;

  while (hhmmToMinutesOfDay(cur) < hhmmToMinutesOfDay(win.end)) {
    const maxEnd = hourPlus(cur, AUTOGEN_SHIFT_HOURS);
    const targetEnd = hhmmToMinutesOfDay(maxEnd) > hhmmToMinutesOfDay(win.end) ? win.end : maxEnd;
    const periodKey = autogenPeriodForHour(cur);

    const rotationOrder = pool.map((_, i) => (idx + i) % pool.length);
    const tryOrder = [...rotationOrder].sort((ra, rb) => {
      const aMatch = autogenMatchesTimePref(pool[ra], periodKey) ? 0 : 1;
      const bMatch = autogenMatchesTimePref(pool[rb], periodKey) ? 0 : 1;
      return aMatch - bMatch;
    });

    let assigned = false;
    for (const poolIdx of tryOrder) {
      const candidate = pool[poolIdx];
      let end = targetEnd;
      while (hhmmToMinutesOfDay(end) > hhmmToMinutesOfDay(cur)) {
        if (canAssign(candidate, cur, end)) {
          candidate.tasks.push({
            id: uid(), type: 'Sentry',
            label: autogenLabel('Sentry', { start: cur, end }),
            start: cur, end,
            color: taskColor(null, 'Sentry'),
          });
          assignedCount++;
          idx = (poolIdx + 1) % pool.length;
          cur = end;
          assigned = true;
          break;
        }
        end = hourPlus(end, -1);
      }
      if (assigned) break;
    }
    if (!assigned) { gaps.push(`Sentry ${cur}`); cur = targetEnd; }
  }
  return assignedCount;
}

// PHASE 1B — same guarantee as Sentry above, applied to VAC and Service:
// walks forward from VAC's window start handing one turn per Service member
// (in preference-aware order, repeating only once everyone still needing a
// turn has been tried and none fit) so nobody goes the whole day without
// VAC. Phase 2 still fills in the rest of the day for VAC same as PAC/PO —
// Service and Combatants both remain free to pick up further turns there.
function autogenAssignServiceVacTurns(gaps) {
  const pool = data.personnel.filter(p => p.group === 'service');
  if (!pool.length) return 0;
  const win = TASK_WINDOWS.VAC;
  let assignedCount = 0;
  let cur = win.start;

  while (hhmmToMinutesOfDay(cur) < hhmmToMinutesOfDay(win.end)) {
    const remaining = pool.filter(p => !autogenHasServedType(p, 'VAC'));
    if (!remaining.length) break; // everyone's had their guaranteed turn

    const periodKey = autogenPeriodForHour(cur);
    const ordered = [...remaining].sort((a, b) => {
      const aMatch = autogenMatchesTimePref(a, periodKey) ? 0 : 1;
      const bMatch = autogenMatchesTimePref(b, periodKey) ? 0 : 1;
      return aMatch - bMatch;
    });

    const maxEnd = hourPlus(cur, AUTOGEN_SHIFT_HOURS);
    const targetEnd = hhmmToMinutesOfDay(maxEnd) > hhmmToMinutesOfDay(win.end) ? win.end : maxEnd;

    let assigned = false;
    for (const candidate of ordered) {
      let end = targetEnd;
      while (hhmmToMinutesOfDay(end) > hhmmToMinutesOfDay(cur)) {
        if (canAssign(candidate, cur, end)) {
          candidate.tasks.push({
            id: uid(), type: 'VAC',
            label: autogenLabel('VAC', { start: cur, end }),
            start: cur, end,
            color: taskColor(null, 'VAC'),
            guaranteed: true,
          });
          assignedCount++;
          cur = end;
          assigned = true;
          break;
        }
        end = hourPlus(end, -1);
      }
      if (assigned) break;
    }
    if (!assigned) cur = targetEnd; // nobody still needing a turn fit here — try later in the day
  }

  pool.filter(p => !autogenHasServedType(p, 'VAC')).forEach(p => gaps.push(`VAC turn for ${p.name}`));
  return assignedCount;
}

// PHASE 2 — hour-by-hour relay for the 3 shared posts, working around
// whatever Sentry/Service-VAC commitments already locked in above.
// autogenFillPost's shrinking fallback is what makes this safe: if someone's
// ideal 3hr block would run into one of their own other commitments, it
// hands them a shorter block that fits instead of leaving the post empty.
function autogenAssignSharedPosts(gaps) {
  let assignedCount = 0;
  for (const h of AUTOGEN_HOURS) {
    for (const type of ['PAC', 'VAC', 'PO']) {
      const win = TASK_WINDOWS[type];
      if (hhmmToMinutesOfDay(h) < hhmmToMinutesOfDay(win.start)) continue;
      if (hhmmToMinutesOfDay(h) >= hhmmToMinutesOfDay(win.end)) continue;
      if (autogenIsHourCovered(type, h)) continue;

      const periodKey = autogenPeriodForHour(h);
      const result    = autogenFillPost(type, h, periodKey);
      if (!result) { gaps.push(`${type} ${h}`); continue; }
      const { person, end: shiftEnd } = result;

      person.tasks.push({
        id: uid(), type,
        label: autogenLabel(type, { start: h, end: shiftEnd }),
        start: h, end: shiftEnd,
        color: taskColor(null, type),
      });
      assignedCount++;
    }
  }
  return assignedCount;
}

function runAutogenSchedule() {
  const clearFirst = document.getElementById('autogen-clear').checked;
  if (clearFirst) {
    data.personnel.forEach(p => {
      if (p.group === 'combatants' || p.group === 'service') p.tasks = [];
    });
  }

  autogenRotationCursor = { PAC: 0, VAC: 0, PO: 0 };
  const gaps = [];
  let assignedCount = 0;
  assignedCount += autogenAssignSentryRotation(gaps);
  assignedCount += autogenAssignServiceVacTurns(gaps);
  assignedCount += autogenAssignSharedPosts(gaps);

  autogenRebalance();

  const resultEl = document.getElementById('autogen-result');
  const gapNote = gaps.length
    ? `<br><b>${gaps.length} hour(s) short-staffed</b> — add more personnel to close: ${gaps.join(', ')}.`
    : '';
  resultEl.innerHTML = `✔ <b>${assignedCount} shift(s) assigned</b> for Combatants &amp; Service on Day ${data.day}.${gapNote}`;
  resultEl.className = 'gen-result ' + (gaps.length ? 'warn' : 'success');
  resultEl.style.display = '';

  render();
}

// ═══════════════════════════════════════════════
//  DRAG-TO-MOVE / DRAG-TO-RESIZE
// ═══════════════════════════════════════════════
let dragState    = null;
let lastDragMoved = false;
const SNAP_MINS  = 30;

function initDragState(clientX, personId, taskId, timelineCell, bar, isResize) {
  dragState = {
    type: isResize ? 'resize' : 'move',
    bar, personId, taskId, timelineCell,
    startMouseX: clientX,
    origLeft:  parseFloat(bar.style.left),
    origWidth: parseFloat(bar.style.width),
    moved: false,
  };
  bar.classList.add('dragging');
  document.body.style.cursor = isResize ? 'ew-resize' : 'grabbing';
}

function startBarDrag(e, personId, taskId, timelineCell) {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();

  const isHandle = e.currentTarget.classList.contains('resize-handle');
  const bar      = isHandle ? e.currentTarget.parentElement : e.currentTarget;
  const isResize = isHandle || e.clientX > bar.getBoundingClientRect().right - 10;
  initDragState(e.clientX, personId, taskId, timelineCell, bar, isResize);
}

function handleDragMove(clientX, clientY) {
  if (!dragState) return;

  const cellW  = dragState.timelineCell.getBoundingClientRect().width;
  const dxPx   = clientX - dragState.startMouseX;
  const dxPct  = (dxPx / cellW) * 100;

  if (Math.abs(dxPx) > 5) dragState.moved = true;
  if (!dragState.moved) return;

  if (dragState.type === 'move') {
    const rawMins = visualPctToMins(dragState.origLeft + dxPct);
    const snappedMins = Math.max(0, Math.min(TOTAL_MINS, Math.round(rawMins / SNAP_MINS) * SNAP_MINS));
    dragState.bar.style.left = minsToVisualPct(snappedMins) + '%';
  } else {
    const rawRightMins = visualPctToMins(dragState.origLeft + dragState.origWidth + dxPct);
    const snappedRight = Math.round(rawRightMins / SNAP_MINS) * SNAP_MINS;
    const origLeftMins = visualPctToMins(dragState.origLeft);
    const clampedRight = Math.max(origLeftMins + SNAP_MINS, Math.min(TOTAL_MINS, snappedRight));
    dragState.bar.style.width = (minsToVisualPct(clampedRight) - dragState.origLeft) + '%';
  }

  const left  = parseFloat(dragState.bar.style.left);
  const width = parseFloat(dragState.bar.style.width);
  const sTime = minsToTime(Math.round(visualPctToMins(left)         / SNAP_MINS) * SNAP_MINS % TOTAL_MINS);
  const eTime = minsToTime(Math.round(visualPctToMins(left + width) / SNAP_MINS) * SNAP_MINS % TOTAL_MINS);

  const timeSpan = dragState.bar.querySelector('.bar-time');
  if (timeSpan) timeSpan.textContent = sTime + '–' + eTime;

  const tip = document.getElementById('drag-tooltip');
  tip.textContent = sTime + ' – ' + eTime;
  tip.style.left  = (clientX + 14) + 'px';
  tip.style.top   = (clientY - 32) + 'px';
  tip.style.display = '';
}

function handleDragEnd() {
  if (!dragState) return;

  const { bar, personId, taskId, moved } = dragState;
  bar.classList.remove('dragging');
  document.body.style.cursor = '';
  document.getElementById('drag-tooltip').style.display = 'none';

  if (moved) {
    lastDragMoved = true;
    const left  = parseFloat(bar.style.left);
    const right = left + parseFloat(bar.style.width);
    const newStart = minsToTime(Math.round(visualPctToMins(left)  / SNAP_MINS) * SNAP_MINS % TOTAL_MINS);
    const newEnd   = minsToTime(Math.round(visualPctToMins(right) / SNAP_MINS) * SNAP_MINS % TOTAL_MINS);
    const p = data.personnel.find(x => x.id === personId);
    const t = p.tasks.find(x => x.id === taskId);
    t.start = newStart; t.end = newEnd;
    if (t.type !== 'Custom') t.label = `${t.type} ${newStart}-${newEnd}`;
    render();
  }

  dragState = null;
}

document.addEventListener('mousemove', (e) => { handleDragMove(e.clientX, e.clientY); });
document.addEventListener('mouseup',   () =>  { handleDragEnd(); });
document.addEventListener('touchmove', (e) => {
  if (!dragState) return;
  e.preventDefault();
  handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
document.addEventListener('touchend', () => { handleDragEnd(); });

// ═══════════════════════════════════════════════
//  TOKEN-BASED STORAGE (localStorage + URL hash)
// ═══════════════════════════════════════════════
const STORAGE_TOKEN_KEY = 'scheduleGen_token';

// All meta fields with safe defaults
const META_DEFAULTS = {
  flag0600: '', flag1800: '',
  prowl: '', nightProwl1: '', nightProwl2: '',
  strength: '00 / 00 / 00', svcAvg: 0, notes: [],
  ignoredViolations: [],
  date: new Date().toISOString().slice(0, 10),
};

function mergeDayEntry(target, src) {
  if (!src) return;
  if (src.wbgt      !== undefined) target.wbgt      = src.wbgt;
  if (src.groups    !== undefined) target.groups    = src.groups;
  if (src.personnel !== undefined) target.personnel = src.personnel;
  target.meta = { ...META_DEFAULTS, ...target.meta, ...(src.meta ?? {}) };
  target.meta.ignoredViolations = Array.isArray(target.meta.ignoredViolations)
    ? target.meta.ignoredViolations : [];
}

function applyParsed(parsed) {
  if (!parsed) return;
  if (parsed.allDays) {
    // Current multi-day token format: { allDays: {1,2,3}, day }
    for (let i = 1; i <= 3; i++) mergeDayEntry(allDays[i], parsed.allDays[i]);
    applyDayPointers(parsed.day || 1);
  } else {
    // Legacy single-day token format: { data: {day, wbgt, groups, personnel, meta}, genRequirements }
    const d = parsed.data || parsed;
    mergeDayEntry(allDays[1], d);
    applyDayPointers(1);
  }
}

function saveToStorage() {
  try {
    const token = encodeToken({ allDays, day: data.day });
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    flashSaveIndicator();
  } catch (e) {
    console.warn('Token save failed:', e);
  }
}

function loadFromStorage() {
  try {
    // Try new token format first
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (token) { applyParsed(decodeToken(token)); return; }

    // Migrate from old JSON format if it exists
    const oldData = localStorage.getItem('scheduleGen_data');
    if (oldData) {
      const parsed = JSON.parse(oldData);
      applyParsed(parsed);
      // Re-save in new token format and clear old keys
      saveToStorage();
      localStorage.removeItem('scheduleGen_data');
      localStorage.removeItem('scheduleGen_genRequirements');
    }
  } catch (e) {
    console.warn('Token load failed:', e);
  }
}

// Brief "Saved ✓" flash in the toolbar
let _saveTimer = null;
function flashSaveIndicator() {
  let el = document.getElementById('save-indicator');
  if (!el) return;
  el.textContent = '✔ Saved';
  el.style.opacity = '1';
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => { el.style.opacity = '0'; }, 1800);
}

// ═══════════════════════════════════════════════
//  LUMINANCE
// ═══════════════════════════════════════════════
function hexLuminance(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// ═══════════════════════════════════════════════
//  IGNORE VIOLATION MODAL
// ═══════════════════════════════════════════════
function openIgnoreModal(taskId, taskLabel) {
  document.getElementById('ignore-modal-label').textContent = `"${taskLabel}" exceeds 3 hrs. Ignore due to manpower shortage?`;
  document.getElementById('modal-ignore').classList.add('open');
  document.getElementById('ignore-yes-btn').onclick = () => {
    if (!data.meta.ignoredViolations) data.meta.ignoredViolations = [];
    data.meta.ignoredViolations.push(taskId);
    saveToStorage();
    closeModal('modal-ignore');
    render();
  };
  document.getElementById('ignore-no-btn').onclick = () => closeModal('modal-ignore');
}

// ═══════════════════════════════════════════════
//  TOOLBAR MOBILE MENU
// ═══════════════════════════════════════════════
function toggleToolbarMenu() {
  document.getElementById('toolbar').classList.toggle('menu-open');
}
document.addEventListener('click', (e) => {
  const toolbar = document.getElementById('toolbar');
  if (toolbar.classList.contains('menu-open') && !toolbar.contains(e.target)) {
    toolbar.classList.remove('menu-open');
  }
});

// ═══════════════════════════════════════════════
//  SCREENSHOT
// ═══════════════════════════════════════════════
async function captureScreenshot(btn) {
  if (typeof html2canvas === 'undefined') {
    alert('Screenshot library not loaded — please refresh and try again.');
    return;
  }
  const orig = btn.textContent;
  btn.textContent = '⏳…';
  btn.disabled = true;

  const wrapper  = document.getElementById('schedule-wrapper');
  const table    = document.getElementById('schedule-table');
  const area     = document.getElementById('capture-area');

  // Temporarily expand so full table width is captured
  const prevWrapperOverflow = wrapper.style.overflowX;
  const prevTableWidth      = table.style.minWidth;
  const fullW = Math.max(table.scrollWidth, 1400);
  wrapper.style.overflowX = 'visible';
  table.style.minWidth    = fullW + 'px';

  // Give browser one frame to reflow
  await new Promise(r => requestAnimationFrame(r));

  try {
    const canvas = await html2canvas(area, {
      scale: 1.8,
      useCORS: true,
      logging: false,
      backgroundColor: '#e8edf4',
      width:  area.scrollWidth,
      height: area.scrollHeight,
      windowWidth:  area.scrollWidth,
      windowHeight: area.scrollHeight,
    });

    const a = document.createElement('a');
    a.download = `schedule_day${data.day}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  } catch (err) {
    alert('Screenshot failed — use 🖨 Print instead.');
  }

  wrapper.style.overflowX = prevWrapperOverflow;
  table.style.minWidth    = prevTableWidth;
  btn.textContent = orig;
  btn.disabled    = false;
}

// ═══════════════════════════════════════════════
//  SHARE AS URL LINK (replaces file export/import)
// ═══════════════════════════════════════════════
// Encode payload to base64 URL token (Unicode-safe)
function encodeToken(obj) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

// Decode base64 URL token back to object
function decodeToken(token) {
  return JSON.parse(decodeURIComponent(escape(atob(token))));
}

function shareAsLink(btn) {
  try {
    const token   = encodeToken({ allDays, day: data.day });
    const base    = location.href.split('#')[0]; // works on file:// and http://
    const url     = base + '#' + token;
    const orig    = btn.textContent;

    const doCopy = (text) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback for file:// or restricted contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      return Promise.resolve();
    };

    doCopy(url).then(() => {
      btn.textContent = '✔ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2500);
    }).catch(() => {
      // Last resort — show URL for manual copy
      prompt('Copy this link to share your schedule:', url);
      btn.textContent = orig;
    });
  } catch (e) {
    alert('Could not generate link: ' + e.message);
  }
}

function loadFromURL() {
  const hash = location.hash.slice(1);
  if (!hash) return false;
  try {
    applyParsed(decodeToken(hash));
    try { history.replaceState(null, '', location.pathname + location.search); } catch {}
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
loadFromStorage();
const _urlLoaded = loadFromURL();
if (_urlLoaded) saveToStorage();
updateDayTabsUI();
initColGroup();
render();
