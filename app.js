import { initialState, validRange, startRound, nextTurn, updateType, isSavedState, migrateSavedState, effectiveRange, addSpeedEffect, removeSpeedEffect } from './game.js';

const storageKey = 'tbj-tracker-v1';
let state = initialState();
let storageAvailable = true;
let isRolling = false;
let openEffects = null;
try {
  const saved = migrateSavedState(JSON.parse(localStorage.getItem(storageKey)));
  if (isSavedState(saved)) state = saved;
} catch { storageAvailable = false; }
const $ = selector => document.querySelector(selector);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const typeOf = player => state.types.find(type => type.id === player.typeId);
const short = name => name.trim().split(/\s+/).map(word => Array.from(word)[0]).slice(0, 2).join('').toUpperCase() || '?';
let toastTimer;
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
}
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#save-status').textContent = storageAvailable ? 'Saved on this device' : 'Session only · saving unavailable';
}
function rangeInputs(item, prefix) {
  return `<div class="range-inputs"><label class="sr-only" for="${prefix}-min">Minimum speed</label><input id="${prefix}-min" data-field="min" type="number" min="1" max="999" required value="${item.min}"><span>–</span><label class="sr-only" for="${prefix}-max">Maximum speed</label><input id="${prefix}-max" data-field="max" type="number" min="1" max="999" required value="${item.max}"></div>`;
}
function signed(amount) { return amount >= 0 ? `+${amount}` : String(amount); }
function effectName(effect) { return `${effect.kind === 'haste' ? 'Haste' : 'Bind'} ${effect.kind === 'haste' ? '+' : '−'}${effect.amount}`; }
function previewMarkup(player) {
  const range = effectiveRange(player);
  return `Next roll <strong>${range.min}–${range.max}</strong>${range.modifier ? `<span class="net-modifier">(${signed(range.modifier)} net)</span>` : ''}`;
}
function effectEditor(player) {
  return `<form class="effect-editor" id="effects-${escape(player.id)}" ${openEffects === player.id ? '' : 'hidden'}>
    <h3>Add speed effect</h3><div class="effect-fields">
      <label>Effect<select name="kind"><option value="haste">Haste (+)</option><option value="bind">Bind (−)</option></select></label>
      <label>Amount<input name="amount" type="number" min="1" max="999" value="2" required></label>
      <label>Duration<select name="duration"><option value="rounds">Full rounds</option><option value="conditional">Until removed</option></select></label>
      <label>Rounds<input name="rounds" type="number" min="1" max="99" value="2" required></label>
    </div><label class="effect-label">Condition / label (optional)<input name="label" maxlength="60" placeholder="e.g. Hunter has not attacked"></label>
    <p>Applies on the next roll. Until removed: remove the effect when its condition ends; the current round stays unchanged.</p>
    <button type="submit" class="button button-outline">Add effect</button>
  </form>`;
}
function renderPlayers() {
  $('#player-count').textContent = String(state.players.length).padStart(2, '0');
  $('#survivor-count').value = state.players.filter(player => typeOf(player).role === 'survivor').length;
  $('#players').innerHTML = state.players.map((player, index) => {
    const type = typeOf(player);
    return `<div class="player-card" data-player="${escape(player.id)}"><div class="player-row ${type.role}"><span class="avatar ${type.role}" aria-hidden="true">${type.role === 'adversary' ? '♜' : ['◇', '✦', '⌁'][index % 3]}</span><div class="player-identity"><label class="sr-only" for="name-${escape(player.id)}">Player ${index + 1} username</label><input class="username" id="name-${escape(player.id)}" data-field="username" value="${escape(player.username)}" maxlength="40" placeholder="Player ${String(index + 1).padStart(2, '0')}"><div class="character-line"><span class="role-dot ${type.role}"></span><label class="sr-only" for="type-${escape(player.id)}">Player ${index + 1} character type</label><select id="type-${escape(player.id)}" data-field="typeId">${state.types.filter(item => item.role === type.role).map(item => `<option value="${escape(item.id)}" ${item.id === type.id ? 'selected' : ''}>${escape(item.name)}</option>`).join('')}</select><span class="role-label">${type.role}</span></div></div>${rangeInputs(player, `range-${escape(player.id)}`)}<button class="icon-button remove-player" aria-label="Remove player ${index + 1}" title="Remove player">×</button></div>
      <div class="player-effects"><div class="effects-toolbar"><span class="next-range">${previewMarkup(player)}</span><button type="button" class="effects-toggle" aria-expanded="${openEffects === player.id}" aria-controls="effects-${escape(player.id)}" aria-label="Speed effects for player ${index + 1}">${openEffects === player.id ? 'Close effects' : '＋ Effects'}</button></div>
      ${player.effects.length ? `<div class="effect-chips">${player.effects.map(effect => `<span class="effect-chip ${effect.kind}"><span>${escape(effectName(effect))}${effect.label ? ` · ${escape(effect.label)}` : ''}<small> · ${effect.roundsRemaining === null ? 'until removed' : `${effect.roundsRemaining} round${effect.roundsRemaining === 1 ? '' : 's'} left`}</small></span><button type="button" data-remove-effect="${escape(effect.id)}" aria-label="Remove ${escape(effectName(effect))}${effect.label ? ` ${escape(effect.label)}` : ''} from player ${index + 1}">×</button></span>`).join('')}</div>` : ''}
      ${effectEditor(player)}</div></div>`;
  }).join('') || '<div class="empty-roster">No players added. Add a survivor or adversary.</div>';
  $('#next-round-note').textContent = state.round ? ' Roster changes apply on the next roll.' : '';
  $('#add-survivor').disabled = Number($('#survivor-count').value) >= 24;
  $('#add-adversary').disabled = state.players.filter(player => typeOf(player).role === 'adversary').length >= 8;
}
function renderTypes() {
  $('#types').innerHTML = state.types.map(type => {
    const used = state.players.some(player => player.typeId === type.id);
    const lastOfRole = state.types.filter(item => item.role === type.role).length === 1;
    return `<div class="type-row" data-type="${escape(type.id)}"><span class="avatar ${type.role}" aria-hidden="true">${type.role === 'adversary' ? '♜' : '◇'}</span><div class="type-identity"><label class="sr-only" for="type-name-${escape(type.id)}">Character name</label><input class="type-name" id="type-name-${escape(type.id)}" data-field="name" maxlength="32" required value="${escape(type.name)}"><span class="type-team">${type.role}</span></div>${rangeInputs(type, `default-${escape(type.id)}`)}<button class="icon-button remove-type" aria-label="Delete ${escape(type.name)} type" title="${used ? 'Remove players using this type first' : lastOfRole ? 'Keep at least one type per team' : 'Delete type'}" ${used || lastOfRole ? 'disabled' : ''}>×</button></div>`;
  }).join('');
}
function renderRound() {
  const active = state.queue.length > 0 && state.current < state.queue.length;
  const complete = state.queue.length > 0 && !active;
  $('#round-number').textContent = String(state.round).padStart(2, '0');
  $('#round-status').textContent = isRolling ? 'ROLLING' : active ? 'ROUND IN PLAY' : complete ? 'ROUND COMPLETE' : 'READY TO ROLL';
  $('#round-status').classList.toggle('in-play', active);
  $('#turn-progress').textContent = active ? `${state.current} of ${state.queue.length} acted` : complete ? 'Everyone has acted' : 'Waiting for the first roll';
  $('#progress-bar').style.width = state.queue.length ? `${state.current / state.queue.length * 100}%` : '0%';
  $('#play-label').textContent = isRolling ? 'Rolling…' : state.round ? 'Play next round' : 'Play first round';
  $('#play').disabled = isRolling || !state.players.length;
  $('#next').disabled = isRolling || !active;
  $('#next-label').textContent = active && state.current === state.queue.length - 1 ? 'Finish round' : 'Next turn';
  $('#reset').disabled = isRolling || !state.round;
  $('#roll-animation').hidden = !isRolling;
  $('#turn-list').hidden = isRolling;
  $('.roster-panel').inert = isRolling;
  $('.initiative-panel').setAttribute('aria-busy', String(isRolling));
  $('#turn-list').innerHTML = !state.queue.length ? `<div class="empty-state"><div class="empty-dice"><span>✦</span><div>⚄</div><span>✧</span></div><h3>No active round</h3><p>Press Play first round to generate turn order.</p></div>` : `${complete ? '<div class="round-complete"><span>✓</span><div>Round complete<small>Press Play next round to reroll.</small></div></div>' : ''}<ol class="initiative-list">${state.queue.map((player, index) => {
    const done = index < state.current;
    const current = index === state.current;
    return `<li class="turn-row ${current ? 'current' : ''} ${done ? 'done' : ''} ${player.role}" ${current ? 'aria-current="step"' : ''}><span class="position">${done ? '<span aria-label="Acted">✓</span>' : String(index + 1).padStart(2, '0')}</span><span class="turn-avatar ${player.role}">${escape(short(player.name))}</span><div class="turn-identity"><strong>${escape(player.name)}</strong><span>${escape(player.typeName)} <span class="role-separator">·</span> ${player.role}</span>${player.effects.length ? `<div class="turn-effects" aria-label="Effects used for this roll">${player.effects.map(effect => `<span class="${effect.kind}" title="${escape(effect.label || effectName(effect))}">${escape(effectName(effect))}${effect.label ? ` · ${escape(effect.label)}` : ''}</span>`).join('')}</div>` : ''}${current ? '<span class="acting-label">CURRENT TURN</span>' : ''}</div><div class="roll-value"><strong>${player.roll}</strong><span>${player.min}–${player.max}</span></div></li>`;
  }).join('')}</ol>`;
}
function render() { renderPlayers(); renderTypes(); renderRound(); renderSound(); persist(); }
function showTab(tab) {
  for (const name of ['players', 'types']) {
    const selected = name === tab;
    $(`#${name}-tab`).classList.toggle('active', selected);
    $(`#${name}-tab`).setAttribute('aria-selected', selected);
    $(`#${name}-tab`).tabIndex = selected ? 0 : -1;
    $(`#${name}-view`).hidden = !selected;
  }
}
for (const tab of document.querySelectorAll('[data-tab]')) {
  tab.addEventListener('click', () => showTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 'players' : event.key === 'End' ? 'types' : tab.dataset.tab === 'players' ? 'types' : 'players';
      showTab(next); $(`#${next}-tab`).focus();
    }
  });
}
$('[data-open-types]').addEventListener('click', () => { showTab('types'); $('#types-tab').focus(); });
function addPlayer(role) {
  const type = state.types.find(item => item.role === role);
  const count = state.players.filter(player => typeOf(player).role === role).length;
  if (count >= (role === 'survivor' ? 24 : 8)) return;
  state.players.push({ id: crypto.randomUUID(), typeId: type.id, username: '', min: type.min, max: type.max, effects: [] });
}
$('#add-survivor').addEventListener('click', () => { addPlayer('survivor'); render(); });
$('#add-adversary').addEventListener('click', () => { addPlayer('adversary'); render(); });
$('#survivor-count').addEventListener('change', event => {
  const target = Number(event.target.value);
  if (!event.target.value || !Number.isInteger(target) || target < 0 || target > 24) { toast('Choose between 0 and 24 survivors.'); renderPlayers(); return; }
  let count = state.players.filter(player => typeOf(player).role === 'survivor').length;
  while (count < target) { addPlayer('survivor'); count++; }
  while (count > target) { const index = state.players.findLastIndex(player => typeOf(player).role === 'survivor'); state.players.splice(index, 1); count--; }
  render();
});
$('#players').addEventListener('input', event => {
  const row = event.target.closest('[data-player]');
  if (!row || event.target.dataset.field !== 'username') return;
  state.players.find(player => player.id === row.dataset.player).username = event.target.value;
  persist();
});
function readRange(row) {
  const minInput = row.querySelector('[data-field="min"]');
  const maxInput = row.querySelector('[data-field="max"]');
  minInput.setCustomValidity(''); maxInput.setCustomValidity('');
  const min = Number(minInput.value), max = Number(maxInput.value);
  if (!minInput.reportValidity() || !maxInput.reportValidity()) return null;
  if (!validRange(min, max)) { maxInput.setCustomValidity('Maximum speed must be at least the minimum.'); maxInput.reportValidity(); return null; }
  return { min, max };
}
$('#players').addEventListener('change', event => {
  const row = event.target.closest('[data-player]');
  if (!row) return;
  const player = state.players.find(player => player.id === row.dataset.player);
  if (event.target.dataset.field === 'typeId') {
    const type = state.types.find(item => item.id === event.target.value);
    Object.assign(player, { typeId: type.id, min: type.min, max: type.max }); render();
  } else if (['min', 'max'].includes(event.target.dataset.field)) {
    const range = readRange(row);
    if (range) { Object.assign(player, range); row.querySelector('.next-range').innerHTML = previewMarkup(player); persist(); }
  }
});
$('#players').addEventListener('click', event => {
  const card = event.target.closest('[data-player]');
  if (!card || isRolling) return;
  if (event.target.closest('.effects-toggle')) {
    openEffects = openEffects === card.dataset.player ? null : card.dataset.player;
    for (const item of document.querySelectorAll('.player-card')) {
      const editor = item.querySelector('.effect-editor'), toggle = item.querySelector('.effects-toggle');
      editor.hidden = openEffects !== item.dataset.player;
      toggle.setAttribute('aria-expanded', String(!editor.hidden));
      toggle.textContent = editor.hidden ? '＋ Effects' : 'Close effects';
    }
  } else if (event.target.closest('[data-remove-effect]')) {
    state = removeSpeedEffect(state, card.dataset.player, event.target.closest('[data-remove-effect]').dataset.removeEffect);
    renderPlayers(); persist();
  } else if (event.target.closest('.remove-player')) {
    state.players = state.players.filter(player => player.id !== card.dataset.player); render();
  }
});
$('#players').addEventListener('change', event => {
  if (event.target.name !== 'duration') return;
  const rounds = event.target.form.elements.rounds;
  rounds.disabled = event.target.value === 'conditional';
});
$('#players').addEventListener('submit', event => {
  if (!event.target.matches('.effect-editor')) return;
  event.preventDefault();
  if (isRolling) return;
  const form = event.target, data = new FormData(form);
  const effect = { id: crypto.randomUUID(), kind: data.get('kind'), amount: Number(data.get('amount')),
    roundsRemaining: data.get('duration') === 'conditional' ? null : Number(data.get('rounds')), label: data.get('label').trim() };
  try {
    state = addSpeedEffect(state, form.closest('[data-player]').dataset.player, effect);
    renderPlayers(); persist(); toast('Effect added. It applies on the next roll.');
  } catch (error) { toast(error.message); }
});
$('#types').addEventListener('change', event => {
  const row = event.target.closest('[data-type]');
  if (!row) return;
  const range = readRange(row);
  const nameInput = row.querySelector('[data-field="name"]');
  nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Enter a character name.');
  if (!range || !nameInput.reportValidity()) return;
  state = updateType(state, row.dataset.type, { name: nameInput.value.trim(), ...range });
  renderPlayers(); persist();
});
$('#types').addEventListener('click', event => {
  const button = event.target.closest('.remove-type');
  if (!button || button.disabled) return;
  state.types = state.types.filter(type => type.id !== event.target.closest('[data-type]').dataset.type);
  render();
});
$('#new-type-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget, data = new FormData(form);
  const min = Number(data.get('min')), max = Number(data.get('max')), name = data.get('name').trim();
  if (!name || !validRange(min, max)) { toast('Enter a name and a valid speed range, with minimum no higher than maximum.'); return; }
  if (state.types.length >= 100) { toast('You can have up to 100 character types.'); return; }
  state.types.push({ id: crypto.randomUUID(), name, role: data.get('role'), min, max });
  form.reset(); render(); toast(`${name} added to character types.`);
});
function validateRoster() {
  for (const row of document.querySelectorAll('[data-player]')) {
    const minInput = row.querySelector('[data-field="min"]'), maxInput = row.querySelector('[data-field="max"]');
    if (!minInput.value || !maxInput.value || !validRange(Number(minInput.value), Number(maxInput.value))) {
      showTab('players'); readRange(row); toast('Check the highlighted player’s speed range.'); return false;
    }
  }
  return true;
}
// All media starts from a user gesture; failed audio never blocks gameplay.
let soundContext, soundGain;
let audioWarningShown = false;
function renderSound() {
  $('#mute').setAttribute('aria-pressed', String(state.soundMuted));
  $('#mute').setAttribute('aria-label', state.soundMuted ? 'Unmute sound' : 'Mute sound');
  $('#mute').textContent = state.soundMuted ? 'Sound muted' : 'Sound on';
}
function prepareTurnSound() {
  if (state.soundMuted) return;
  try {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return;
    if (!soundContext) {
      soundContext = new AudioEngine();
      soundGain = soundContext.createGain(); soundGain.connect(soundContext.destination);
    }
    soundGain.gain.value = 1;
    if (soundContext.state === 'suspended') soundContext.resume().catch(() => {});
  } catch { /* Continue without the optional turn cue. */ }
}
function stopDiceSound() {
  const audio = $('#dice-audio');
  audio.pause();
  try { audio.currentTime = 0; } catch { /* Media may not have loaded yet. */ }
}
function playDiceSound() {
  if (state.soundMuted) return;
  stopDiceSound();
  $('#dice-audio').play().catch(() => {
    if (!state.soundMuted && !audioWarningShown) {
      audioWarningShown = true;
      toast('Dice sound could not play. You can continue playing or mute sound.');
    }
  });
}
function playTurnSound() {
  if (state.soundMuted) return;
  prepareTurnSound();
  if (!soundContext || !soundGain) return;
  try {
    const now = soundContext.currentTime;
    for (const [offset, frequency] of [[0, 660], [.09, 880]]) {
      const oscillator = soundContext.createOscillator(), gain = soundContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(.045, now + offset + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + offset + .13);
      oscillator.connect(gain); gain.connect(soundGain);
      oscillator.start(now + offset); oscillator.stop(now + offset + .14);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
  } catch { /* Continue without sound on unsupported audio devices. */ }
}
$('#mute').addEventListener('click', () => {
  state.soundMuted = !state.soundMuted;
  if (state.soundMuted) {
    stopDiceSound();
    if (soundGain) soundGain.gain.value = 0;
  }
  renderSound(); persist();
});
$('#play').addEventListener('click', () => {
  if (isRolling || !validateRoster()) return;
  try {
    state = startRound(state); // Calculate and save once, before the decorative animation.
    isRolling = true;
    renderRound(); renderPlayers(); persist();
    prepareTurnSound(); playDiceSound();
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 1600;
    window.setTimeout(() => { isRolling = false; renderRound(); }, delay);
  } catch (error) { toast(error.message); }
});
$('#next').addEventListener('click', () => {
  if (isRolling || state.current >= state.queue.length) return;
  stopDiceSound();
  state = nextTurn(state); renderRound(); persist();
  if (state.current < state.queue.length) playTurnSound();
  const list = $('.initiative-list'), current = $('.turn-row.current');
  if (list && current) {
    const target = current.getBoundingClientRect(), bounds = list.getBoundingClientRect();
    if (target.bottom > bounds.bottom) list.scrollTop += target.bottom - bounds.bottom + 12;
  }
});
$('#reset').addEventListener('click', () => {
  if (isRolling) return;
  stopDiceSound();
  state = { ...state, round: 0, queue: [], current: 0 }; renderRound(); renderPlayers(); persist(); toast('Rounds reset. Roster, remaining effects, and character types are kept.');
});
render();
