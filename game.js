export const DEFAULT_TYPES = [
  { id: 'noob', name: 'Noob', role: 'survivor', min: 4, max: 8 },
  { id: 'jester', name: 'Jester', role: 'survivor', min: 4, max: 8 },
  { id: 'firefighter', name: 'Firefighter', role: 'survivor', min: 4, max: 8 },
  { id: 'hemomancer', name: 'Hemomancer', role: 'survivor', min: 4, max: 8 },
  { id: 'knight', name: 'Knight', role: 'survivor', min: 3, max: 7 },
  { id: 'brawler', name: 'Brawler', role: 'survivor', min: 3, max: 7 },
  { id: 'sheriff', name: 'Sheriff', role: 'survivor', min: 3, max: 7 },
  { id: 'maniac', name: 'Maniac', role: 'survivor', min: 3, max: 7 },
  { id: 'sniper', name: 'Sniper', role: 'survivor', min: 2, max: 5 },
  { id: 'doc', name: 'Doc', role: 'survivor', min: 2, max: 5 },
  { id: 'vocalist', name: 'Vocalist', role: 'survivor', min: 4, max: 8 },
  { id: 'assistant', name: 'Assistant', role: 'survivor', min: 4, max: 8 },
  { id: 'shielder', name: 'Shielder', role: 'survivor', min: 1, max: 4 },
  { id: 'wrecker', name: 'Wrecker', role: 'survivor', min: 1, max: 4 },
  { id: 'guest', name: 'Guest', role: 'survivor', min: 4, max: 9 },
  { id: 'spotter', name: 'Spotter', role: 'adversary', min: 5, max: 8 },
  { id: 'anarchist', name: 'Anarchist', role: 'adversary', min: 5, max: 8 },
  { id: 'dullahan', name: 'Dullahan', role: 'adversary', min: 5, max: 8 },
  { id: 'chronos', name: 'Chronos', role: 'adversary', min: 5, max: 8 },
  { id: 'chaser', name: 'Chaser', role: 'adversary', min: 6, max: 9 },
  { id: 'firework', name: 'Firework', role: 'adversary', min: 6, max: 9 },
  { id: 'flare-reaver', name: 'Flare Reaver', role: 'adversary', min: 6, max: 9 },
  { id: 'executioner', name: 'Executioner', role: 'adversary', min: 2, max: 5 },
  { id: 'sin', name: 'Sin', role: 'adversary', min: 2, max: 5 },
  { id: 'apprentice', name: 'Apprentice', role: 'adversary', min: 3, max: 6 },
  { id: 'hunter', name: 'Hunter', role: 'adversary', min: 3, max: 6 },
  { id: 'custodian', name: 'Custodian', role: 'adversary', min: 3, max: 6 },
];
export function initialState() {
  return {
    schemaVersion: 3,
    soundMuted: false,
    types: structuredClone(DEFAULT_TYPES),
    players: [
      { id: 'p1', typeId: 'shielder', username: '', min: 1, max: 4, effects: [] },
      { id: 'p2', typeId: 'noob', username: '', min: 4, max: 8, effects: [] },
      { id: 'p3', typeId: 'guest', username: '', min: 4, max: 9, effects: [] },
      { id: 'p4', typeId: 'spotter', username: '', min: 5, max: 8, effects: [] },
    ],
    round: 0, queue: [], current: 0,
  };
}
export function validRange(min, max) {
  return Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max <= 999 && min <= max;
}
export function validEffect(effect) {
  return effect && typeof effect.id === 'string' && effect.id.length > 0 &&
    ['haste', 'bind'].includes(effect.kind) && Number.isInteger(effect.amount) && effect.amount >= 1 && effect.amount <= 999 &&
    typeof effect.label === 'string' && effect.label.length <= 60 &&
    (effect.roundsRemaining === null || (Number.isInteger(effect.roundsRemaining) && effect.roundsRemaining >= 1 && effect.roundsRemaining <= 99));
}
export function effectiveRange(player) {
  const modifier = (player.effects ?? []).reduce((total, effect) => total + (effect.kind === 'haste' ? effect.amount : -effect.amount), 0);
  const clamp = value => Math.min(999, Math.max(1, value));
  return { min: clamp(player.min + modifier), max: clamp(player.max + modifier), modifier };
}
export function addSpeedEffect(state, playerId, effect) {
  if (!validEffect(effect)) throw new Error('Use Haste or Bind, an amount from 1 to 999, and a duration from 1 to 99 rounds or Until removed.');
  const player = state.players.find(item => item.id === playerId);
  if (!player) throw new Error('That player is no longer in the roster.');
  if ((player.effects ?? []).length >= 20) throw new Error('A player can have up to 20 effects. Remove an effect first.');
  if ((player.effects ?? []).some(item => item.id === effect.id)) throw new Error('That effect already exists.');
  return { ...state, players: state.players.map(item => item.id === playerId
    ? { ...item, effects: [...(item.effects ?? []), { ...effect, label: effect.label.trim() }] } : item) };
}
export function removeSpeedEffect(state, playerId, effectId) {
  return { ...state, players: state.players.map(player => player.id === playerId
    ? { ...player, effects: (player.effects ?? []).filter(effect => effect.id !== effectId) } : player) };
}
export function rollRound(players, types, random = Math.random) {
  if (!players.length) throw new Error('Add at least one player before starting a round.');
  const queue = players.map((player, index) => {
    const type = types.find(item => item.id === player.typeId);
    if (!type || !validRange(player.min, player.max)) throw new Error('Check every speed range: use whole numbers from 1 to 999, with minimum no higher than maximum.');
    if (!Array.isArray(player.effects ?? []) || !(player.effects ?? []).every(validEffect)) throw new Error('Check this player’s speed effects.');
    const range = effectiveRange(player);
    return { ...player, effects: structuredClone(player.effects ?? []), baseMin: player.min, baseMax: player.max,
      name: player.username.trim() || `${type.name} ${index + 1}`, typeName: type.name, role: type.role,
      ...range, roll: range.min + Math.floor(random() * (range.max - range.min + 1)) };
  });
  // Shuffle first so equal rolls have a fair, random order.
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return queue.sort((a, b) => b.roll - a.roll);
}
export function startRound(state, random = Math.random) {
  // Snapshot the applied effects before consuming one round of their duration.
  // The roster then describes the NEXT roll; the queue keeps this round intact.
  const queue = rollRound(state.players, state.types, random);
  const players = state.players.map(player => ({ ...player, effects: (player.effects ?? []).flatMap(effect => {
    if (effect.roundsRemaining === null) return [{ ...effect }];
    return effect.roundsRemaining > 1 ? [{ ...effect, roundsRemaining: effect.roundsRemaining - 1 }] : [];
  }) }));
  return { ...state, players, round: state.round + 1, current: 0, queue };
}
export function nextTurn(state) {
  return { ...state, current: Math.min(state.current + 1, state.queue.length) };
}
export function updateType(state, id, patch) {
  const old = state.types.find(type => type.id === id);
  if (!old) return state;
  return { ...state, types: state.types.map(type => type.id === id ? { ...type, ...patch } : type),
    players: state.players.map(player => player.typeId === id && player.min === old.min && player.max === old.max
      ? { ...player, min: patch.min ?? old.min, max: patch.max ?? old.max } : player) };
}
export function isSavedState(value) {
  if (!value || value.schemaVersion !== 3 || typeof value.soundMuted !== 'boolean' || !Array.isArray(value.types) || !value.types.length || !Array.isArray(value.players) || !Array.isArray(value.queue)) return false;
  if (!value.types.every(type => type && typeof type.id === 'string' && typeof type.name === 'string' && ['survivor', 'adversary'].includes(type.role) && validRange(type.min, type.max))) return false;
  const ids = new Set(value.types.map(type => type.id));
  if (ids.size !== value.types.length || value.types.length > 100 || value.players.length > 32 || value.queue.length > 32) return false;
  if (!['survivor', 'adversary'].every(role => value.types.some(type => type.role === role))) return false;
  const effectsValid = effects => Array.isArray(effects) && effects.length <= 20 && effects.every(validEffect) && new Set(effects.map(effect => effect.id)).size === effects.length;
  if (!value.players.every(player => player && typeof player.id === 'string' && typeof player.username === 'string' && ids.has(player.typeId) && validRange(player.min, player.max) && effectsValid(player.effects))) return false;
  if (new Set(value.players.map(player => player.id)).size !== value.players.length) return false;
  if (['survivor', 'adversary'].some(role => value.players.filter(player => value.types.find(type => type.id === player.typeId).role === role).length > (role === 'survivor' ? 24 : 8))) return false;
  return Number.isInteger(value.round) && value.round >= 0 && Number.isInteger(value.current) && value.current >= 0 && value.current <= value.queue.length && value.queue.every(player => player && typeof player.name === 'string' && typeof player.typeName === 'string' && typeof player.id === 'string' && ['survivor', 'adversary'].includes(player.role) && validRange(player.min, player.max) && Number.isInteger(player.roll) && player.roll >= player.min && player.roll <= player.max && effectsValid(player.effects));
}

function migrateLegacyState(value) {
  if (!value || value.schemaVersion === 2 || !Array.isArray(value.types) || !Array.isArray(value.players) || !Array.isArray(value.queue)) return value;
  const migrated = structuredClone(value);
  const legacyDefaults = {
    shielder: { name: 'Shielder', min: 1, max: 5, target: 'shielder' },
    noob: { name: 'Noob', min: 2, max: 7, target: 'noob' },
    scout: { name: 'Scout', min: 3, max: 8, target: 'guest' },
    stalker: { name: 'Stalker', min: 3, max: 8, target: 'spotter' },
  };
  const aliases = new Map();
  const positiveRange = item => ({ ...item, min: Math.max(1, item.min), max: Math.max(1, item.max) });
  migrated.types = migrated.types.map(type => {
    const old = legacyDefaults[type.id];
    if (old && type.name === old.name && type.min === old.min && type.max === old.max) {
      const replacement = DEFAULT_TYPES.find(item => item.id === old.target);
      aliases.set(type.id, replacement.id);
      return { ...replacement };
    }
    return positiveRange({ ...type, role: type.role === 'killer' ? 'adversary' : type.role });
  });
  const known = new Set(migrated.types.map(type => type.id));
  for (const type of DEFAULT_TYPES) {
    if (!known.has(type.id)) migrated.types.push({ ...type });
  }
  migrated.players = migrated.players.map(player => {
    const oldType = value.types.find(type => type.id === player.typeId);
    const typeId = aliases.get(player.typeId) ?? player.typeId;
    const type = migrated.types.find(item => item.id === typeId);
    const followsDefault = oldType && type && player.min === oldType.min && player.max === oldType.max;
    return positiveRange({ ...player, typeId, ...(followsDefault ? { min: type.min, max: type.max } : {}) });
  });
  // Keep the current round's participants and order; enforce positive speeds.
  migrated.queue = migrated.queue.map(player => positiveRange({ ...player,
    role: player.role === 'killer' ? 'adversary' : player.role, roll: Math.max(1, player.roll) }));
  migrated.schemaVersion = 2;
  return migrated;
}

export function migrateSavedState(value) {
  if (!value || value.schemaVersion === 3 || !Array.isArray(value.types) || !Array.isArray(value.players) || !Array.isArray(value.queue)) return value;
  let migrated = structuredClone(migrateLegacyState(value));
  const changedPresets = [
    ['knight', 2, 6], ['brawler', 2, 6], ['sheriff', 2, 6], ['maniac', 2, 6],
    ['vocalist', 2, 5], ['chaser', 4, 9], ['firework', 4, 9], ['flare-reaver', 4, 9],
  ];
  for (const [id, min, max] of changedPresets) {
    const old = migrated.types.find(type => type.id === id);
    const preset = DEFAULT_TYPES.find(type => type.id === id);
    if (old && old.name === preset.name && old.role === preset.role && old.min === min && old.max === max) {
      migrated = updateType(migrated, id, { min: preset.min, max: preset.max });
    }
  }
  if (!migrated.types.some(type => type.id === 'assistant')) migrated.types.push({ ...DEFAULT_TYPES.find(type => type.id === 'assistant') });
  migrated.players = migrated.players.map(player => ({ ...player, effects: player.effects ?? [] }));
  migrated.queue = migrated.queue.map(player => ({ ...player, effects: player.effects ?? [] }));
  migrated.soundMuted = typeof migrated.soundMuted === 'boolean' ? migrated.soundMuted : false;
  migrated.schemaVersion = 3;
  return migrated;
}
