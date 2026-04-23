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
  'Sentry': '#f44336', 'PAC': '#00e5ff', 'VAC': '#00e676',
  'ND': '#ffd54f', 'SIGC': '#ffd54f', 'GC/PO': '#ce93d8',
  'VAC/PAC': '#00e676', 'Custom': '#90caf9',
};

const GROUP_ALLOWED_TASKS = {
  kah:        ['GC/PO', 'Sentry', 'PAC', 'VAC', 'VAC/PAC', 'Custom'],
  combatants: ['Sentry', 'PAC', 'VAC', 'VAC/PAC', 'Custom'],
  service:    ['PAC', 'VAC', 'VAC/PAC', 'Custom'],
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

let data = {
  day: 1,
  wbgt: {
    '2000': 'WHITE', '0000': 'WHITE', '0400': 'WHITE',
    '0800': 'WHITE', '1000': 'GREEN', '1200': 'RED',
    '1400': 'YELLOW', '1600': 'WHITE', '1800': 'WHITE',
  },
  groups: [
    { id: 'kah',        label: 'KEY APPOINTMENT HOLDERS (KAH)' },
    { id: 'combatants', label: 'COMBATANTS (DAY)' },
    { id: 'service',    label: 'SERVICE (DAY)' },
    { id: 'night',      label: 'NIGHT DUTY' },
  ],
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
    prowl: 'Adlan,ZZ', strength: '02 / 06 / 02', svcAvg: 4.5, notes: [],
  },
};

// ═══════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════
function uid() { return '_' + Math.random().toString(36).slice(2, 9); }

const LANE_H = 42;
const SILENT_STARTS = new Set(['2000', '0000', '0400', '1800']);
function isSilentSlot(slot) { return SILENT_STARTS.has(slot.start); }

// Visual scale: silent slots get 0.5× space, non-silent get 1.5× space
// Morning silent slots (2000–0800) stay squashed; evening 1800–2000 matches non-silent width
const MORNING_SILENT = new Set(['2000', '0000', '0400']);
const VISUAL_SLOT_WEIGHTS = TIME_SLOTS.map(s => MORNING_SILENT.has(s.start) ? 0.5 : 1.5);

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
const TIMELINE_PCT = 81;
const COL_WIDTHS = [
  '8%',
  ...TIME_SLOTS.map((s, i) => {
    const vu = s.hours * 60 * VISUAL_SLOT_WEIGHTS[i];
    return (TIMELINE_PCT * vu / TOTAL_VISUAL_UNITS).toFixed(4) + '%';
  }),
  '3.5%', '3.5%', '4%',
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
  th(r1, 'Total', 1, 3);

  const r2 = thead.insertRow();
  r2.className = 'hdr-top';
  th(r2, `Day ${data.day}`);
  TIME_SLOTS.forEach(s => {
    th(r2, s.label).classList.add(isSilentSlot(s) ? 'col-silent' : 'col-nonsilent');
  });
  th(r2, 'Total D2');
  th(r2, 'Total D1');
  th(r2, 'Total hr Mount');

  const r3 = thead.insertRow();
  r3.className = 'hdr-wbgt';
  r3.insertCell().textContent = 'WBGT Code';
  TIME_SLOTS.forEach(s => {
    const code = data.wbgt[s.start] || 'WHITE';
    const cell = r3.insertCell();
    cell.textContent = code;
    cell.className = (WBGT_CLASSES[code] || 'wbgt-white') + (isSilentSlot(s) ? ' wbgt-silent-col' : '');
  });
  r3.insertCell(); r3.insertCell(); r3.insertCell();
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
    gCell.colSpan = 13;
    gCell.textContent = group.label;

    data.personnel
      .filter(p => p.group === group.id)
      .forEach(person => renderPersonRow(tbody, person, avg, constraintCache));

    const addRow = tbody.insertRow();
    const addCell = addRow.insertCell();
    addCell.colSpan = 13;
    addCell.style.border = 'none';
    const addBtn = document.createElement('button');
    addBtn.className = 'add-person-btn';
    addBtn.textContent = `+ Add person to ${group.label}`;
    addBtn.onclick = () => openAddPersonModal(group.id);
    addCell.appendChild(addBtn);
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

  const clickZone = document.createElement('div');
  clickZone.className = 'timeline-click-zone';
  clickZone.title = 'Click to add task';
  clickZone.onclick = (e) => onTimelineClick(e, person.id, timeCell);
  timeCell.appendChild(clickZone);

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
    timeSpan.className   = 'bar-time';
    timeSpan.textContent = task.start + '–' + task.end;

    bar.appendChild(typeSpan);
    bar.appendChild(timeSpan);
    bar.title = `${task.label}\n${task.start} – ${task.end}\nClick to edit`;

    bar.style.cursor  = 'grab';
    bar.onmousedown   = (e) => startBarDrag(e, person.id, task.id, timeCell);
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
    bar.appendChild(rh);

    timeCell.appendChild(bar);
  });

  const issues = constraintCache.get(person.id) || [];
  if (issues.length > 0) {
    nameCell.title = '⚠ ' + issues.join(' | ');
    nameCell.classList.add('has-violation');
  }

  const hrs      = totalHours(person);
  const d2Cell   = row.insertCell();
  d2Cell.className   = 'total-cell total-d2';
  d2Cell.textContent = hrs > 0 ? hrs.toFixed(2) : '';
  if (hrs > avg * 3) {
    d2Cell.classList.add('over-avg');
    d2Cell.title = '* Hours exceeded avg by >3×';
  }

  row.insertCell().className = 'total-cell total-d1';
  row.insertCell().className = 'total-cell total-hr';
}

function renderFooter(tbody, constraintCache) {
  tbody.insertRow().insertCell().colSpan = 13;

  const flagRow = tbody.insertRow();
  flagRow.className = 'footer-row';
  flagRow.insertCell().colSpan = 2;
  flagRow.insertCell().colSpan = 2;
  flagRow.cells[1].innerHTML = '<b>0600 Flag:</b>';
  const fc3 = flagRow.insertCell(); fc3.colSpan = 3; fc3.textContent = data.meta.flag0600;
  flagRow.insertCell().colSpan = 2;
  flagRow.cells[3].innerHTML = '<b>1800 flag:</b>';
  const fc5 = flagRow.insertCell(); fc5.colSpan = 4; fc5.textContent = data.meta.flag1800;

  const prowlRow = tbody.insertRow();
  prowlRow.className = 'footer-row';
  prowlRow.insertCell();
  prowlRow.insertCell().textContent = '[ ]';
  prowlRow.cells[1].style.textAlign = 'center';
  const pr2 = prowlRow.insertCell(); pr2.colSpan = 2;
  pr2.innerHTML = `<b>Morning Prowl:</b> ${data.meta.prowl}`;
  prowlRow.insertCell().colSpan = 2;
  prowlRow.insertCell().colSpan = 2;
  prowlRow.cells[4].innerHTML = '<b>Total Strength</b>';
  const pr6 = prowlRow.insertCell(); pr6.colSpan = 4; pr6.textContent = data.meta.strength;

  tbody.insertRow().insertCell().colSpan = 13;

  const svcRow = tbody.insertRow();
  svcRow.className = 'footer-row service-avg';
  svcRow.insertCell().colSpan = 5;
  const svc2 = svcRow.insertCell(); svc2.colSpan = 3;
  svc2.innerHTML = '<b>Service Avg Mounting hrs</b>';
  svc2.style.textAlign = 'right';
  const svc3 = svcRow.insertCell(); svc3.colSpan = 2;
  svc3.textContent = data.meta.svcAvg;
  svc3.style.textAlign = 'center';
  svcRow.insertCell().colSpan = 2;

  const legRow = tbody.insertRow();
  legRow.className = 'footer-row';
  legRow.insertCell().colSpan = 6;
  const legRight = legRow.insertCell();
  legRight.colSpan = 7;
  legRight.innerHTML = '<b>Day Only</b> &nbsp;&nbsp; <b>Night Only</b> &nbsp;&nbsp; <b>GC</b>';

  const clRow = tbody.insertRow();
  clRow.className = 'footer-row';
  const clCell = clRow.insertCell();
  clCell.colSpan = 13;
  clCell.innerHTML =
    '<span class="constraint-ok">☑ 3hrs per shift</span> &nbsp;&nbsp; ' +
    '<span class="constraint-ok">☑ ≥ 1hr break after shift</span>';
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
  data.personnel = data.personnel.filter(x => x.id !== _editPersonId);
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

function setDay(v) { data.day = parseInt(v) || 1; render(); }

// ═══════════════════════════════════════════════
//  SCHEDULE GENERATOR
// ═══════════════════════════════════════════════
let genRequirements = [
  { type: 'Sentry', start: '0700', end: '1900', shiftHours: 2, group: 'combatants', color: '#f44336' },
  { type: 'PAC',    start: '0800', end: '1800', shiftHours: 1, group: 'combatants', color: '#00e5ff' },
  { type: 'VAC',    start: '0700', end: '1700', shiftHours: 2, group: 'service',    color: '#00e676' },
  { type: 'ND',     start: '2000', end: '0400', shiftHours: 4, group: 'night',      color: '#ffd54f' },
  { type: 'SIGC',   start: '2000', end: '0800', shiftHours: 8, group: 'night',      color: '#ffd54f' },
];

function openGeneratorModal() {
  renderGenRows();
  document.getElementById('gen-result').style.display = 'none';
  openModal('modal-generator');
}

function renderGenRows() {
  const tbody = document.getElementById('gen-req-body');
  tbody.innerHTML = '';
  genRequirements.forEach((req, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select onchange="genRequirements[${idx}].type=this.value;genRequirements[${idx}].color=taskColor(null,this.value);renderGenRows()">
          ${['Sentry','PAC','VAC','ND','SIGC','GC/PO','VAC/PAC','Custom'].map(t =>
            `<option value="${t}" ${req.type===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </td>
      <td><input type="text" maxlength="4" value="${req.start}" oninput="genRequirements[${idx}].start=this.value.padStart(4,'0')" placeholder="HHMM"></td>
      <td><input type="text" maxlength="4" value="${req.end}"   oninput="genRequirements[${idx}].end=this.value.padStart(4,'0')"   placeholder="HHMM"></td>
      <td><input type="number" min="0.5" max="3" step="0.5" value="${req.shiftHours}" oninput="genRequirements[${idx}].shiftHours=parseFloat(this.value)||1" style="width:60px"></td>
      <td>
        <select onchange="genRequirements[${idx}].group=this.value">
          ${data.groups.map(g =>
            `<option value="${g.id}" ${req.group===g.id?'selected':''}>${g.label}</option>`).join('')}
        </select>
      </td>
      <td style="text-align:center"><input type="color" value="${taskColor(req.color, req.type)}" oninput="genRequirements[${idx}].color=this.value"></td>
      <td><button class="gen-del-btn" onclick="removeGenRow(${idx})">×</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function addGenRow() {
  genRequirements.push({ type: 'Sentry', start: '0800', end: '1000', shiftHours: 2, group: 'combatants', color: '#f44336' });
  renderGenRows();
}

function removeGenRow(idx) {
  genRequirements.splice(idx, 1);
  renderGenRows();
}

function breakIntoShifts(start, end, shiftHours) {
  const shifts    = [];
  const shiftMins = Math.round(shiftHours * 60);
  let cur  = timeToMins(start);
  let endM = timeToMins(end);
  if (endM <= cur) endM += TOTAL_MINS;
  while (cur < endM) {
    const next = Math.min(cur + shiftMins, endM);
    shifts.push({ start: minsToTime(cur), end: minsToTime(next % TOTAL_MINS) });
    cur = next;
  }
  return shifts;
}

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

function runGenerator() {
  const clearFirst = document.getElementById('gen-clear').checked;
  const rotate     = document.getElementById('gen-rotate').checked;

  if (clearFirst) data.personnel.forEach(p => { p.tasks = []; });

  const log = [];
  let totalAssigned = 0;
  let totalUnfilled = 0;

  for (const req of genRequirements) {
    const shifts = breakIntoShifts(req.start, req.end, req.shiftHours);
    const pool   = data.personnel.filter(p => p.group === req.group);

    if (pool.length === 0) {
      log.push(`⚠ No personnel in group for ${req.type} — skipped.`);
      totalUnfilled += shifts.length;
      continue;
    }

    let startIdx = 0;
    for (const shift of shifts) {
      const order = Array.from({ length: pool.length }, (_, i) => (startIdx + i) % pool.length);
      if (rotate) order.sort((a, b) => totalHours(pool[a]) - totalHours(pool[b]));

      let assigned = false;
      for (const idx of order) {
        const person = pool[idx];
        if (!allowedTypes(person.group).includes(req.type)) continue;
        if (canAssign(person, shift.start, shift.end)) {
          person.tasks.push({
            id: uid(), type: req.type,
            label: `${req.type} ${shift.start}-${shift.end}`,
            start: shift.start, end: shift.end,
            color: taskColor(req.color, req.type),
          });
          startIdx = (idx + 1) % pool.length;
          totalAssigned++;
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        log.push(`⚠ Could not fill ${req.type} ${shift.start}–${shift.end} (no available person)`);
        totalUnfilled++;
      }
    }
  }

  // Randomly assign flags (3 combatants each) and prowl (2 combatants)
  const baseCombatants = data.personnel.filter(p => p.group === 'combatants');
  assignCombatants('flag0600', 3, '⚠ Fewer than 3 combatants — 0600 Flag incomplete.', log, baseCombatants);
  assignCombatants('flag1800', 3, null, log, baseCombatants);
  assignCombatants('prowl',    2, '⚠ Fewer than 2 combatants — Morning Prowl incomplete.', log, baseCombatants);

  const resultEl = document.getElementById('gen-result');
  const unfilledNote = totalUnfilled > 0
    ? `<br><b>${totalUnfilled} shift(s) could not be filled</b> — add more personnel or adjust shift lengths.`
    : '';
  resultEl.innerHTML = `✔ <b>${totalAssigned} shifts assigned.</b>${unfilledNote}${log.length ? '<br>' + log.join('<br>') : ''}`;
  resultEl.className = 'gen-result ' + (totalUnfilled > 0 ? 'warn' : 'success');
  resultEl.style.display = '';

  render();
}

function assignCombatants(metaKey, count, warnMsg, log, base) {
  const pool = shuffle(base);
  if (pool.length < count && warnMsg) log.push(warnMsg);
  data.meta[metaKey] = pool.slice(0, count).map(p => p.name).join(',');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═══════════════════════════════════════════════
//  DRAG-TO-MOVE / DRAG-TO-RESIZE
// ═══════════════════════════════════════════════
let dragState    = null;
let lastDragMoved = false;
const SNAP_MINS  = 30;

function startBarDrag(e, personId, taskId, timelineCell) {
  if (e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();

  const isHandle = e.currentTarget.classList.contains('resize-handle');
  const bar      = isHandle ? e.currentTarget.parentElement : e.currentTarget;
  const isResize = isHandle || e.clientX > bar.getBoundingClientRect().right - 10;

  dragState = {
    type: isResize ? 'resize' : 'move',
    bar, personId, taskId, timelineCell,
    startMouseX: e.clientX,
    origLeft:  parseFloat(bar.style.left),
    origWidth: parseFloat(bar.style.width),
    moved: false,
  };

  bar.classList.add('dragging');
  document.body.style.cursor = isResize ? 'ew-resize' : 'grabbing';
}

document.addEventListener('mousemove', (e) => {
  if (!dragState) return;

  const cellW  = dragState.timelineCell.getBoundingClientRect().width;
  const dxPx   = e.clientX - dragState.startMouseX;
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
  tip.style.left  = (e.clientX + 14) + 'px';
  tip.style.top   = (e.clientY - 32) + 'px';
  tip.style.display = '';
});

document.addEventListener('mouseup', () => {
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
});

// ═══════════════════════════════════════════════
//  LOCAL STORAGE PERSISTENCE
// ═══════════════════════════════════════════════
const STORAGE_KEY     = 'scheduleGen_data';
const STORAGE_GEN_KEY = 'scheduleGen_genRequirements';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY,     JSON.stringify(data));
    localStorage.setItem(STORAGE_GEN_KEY, JSON.stringify(genRequirements));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      data.day       = parsed.day       ?? data.day;
      data.wbgt      = parsed.wbgt      ?? data.wbgt;
      data.groups    = parsed.groups    ?? data.groups;
      data.personnel = parsed.personnel ?? data.personnel;
      data.meta      = { ...data.meta,  ...(parsed.meta ?? {}) };

      const rolePatches = { 'Ryan': 'GC' };
      data.personnel.forEach(p => {
        if (rolePatches[p.name] !== undefined) p.role = rolePatches[p.name];
      });
    }
    const savedGen = localStorage.getItem(STORAGE_GEN_KEY);
    if (savedGen) genRequirements = JSON.parse(savedGen);
  } catch (e) {
    console.warn('Could not load from localStorage:', e);
  }
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
//  EXPORT / IMPORT
// ═══════════════════════════════════════════════
function exportData() {
  const payload = JSON.stringify({ data, genRequirements }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `schedule_day${data.day}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed.data) {
        data.day       = parsed.data.day       ?? data.day;
        data.wbgt      = parsed.data.wbgt      ?? data.wbgt;
        data.groups    = parsed.data.groups    ?? data.groups;
        data.personnel = parsed.data.personnel ?? data.personnel;
        data.meta      = { ...data.meta, ...(parsed.data.meta ?? {}) };
      }
      if (parsed.genRequirements) genRequirements = parsed.genRequirements;
      document.getElementById('day-input').value = data.day;
      render();
    } catch {
      alert('Invalid file — could not import.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ═══════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════
loadFromStorage();
document.getElementById('day-input').value = data.day;
initColGroup();
render();
