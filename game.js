export const DEFAULT_TYPES = [
  { id: 'noob', name: 'Noob', role: 'survivor', min: 4, max: 8 },
  { id: 'jester', name: 'Jester', role: 'survivor', min: 4, max: 8 },
  { id: 'firefighter', name: 'Firefighter', role: 'survivor', min: 4, max: 8 },
  { id: 'hemomancer', name: 'Hemomancer', role: 'survivor', min: 4, max: 8 },
  { id: 'knight', name: 'Knight', role: 'survivor', min: 2, max: 6 },
  { id: 'brawler', name: 'Brawler', role: 'survivor', min: 2, max: 6 },
  { id: 'sheriff', name: 'Sheriff', role: 'survivor', min: 2, max: 6 },
  { id: 'maniac', name: 'Maniac', role: 'survivor', min: 2, max: 6 },
  { id: 'sniper', name: 'Sniper', role: 'survivor', min: 2, max: 5 },
  { id: 'doc', name: 'Doc', role: 'survivor', min: 2, max: 5 },
  { id: 'vocalist', name: 'Vocalist', role: 'survivor', min: 2, max: 5 },
  { id: 'shielder', name: 'Shielder', role: 'survivor', min: 1, max: 4 },
  { id: 'wrecker', name: 'Wrecker', role: 'survivor', min: 1, max: 4 },
  { id: 'guest', name: 'Guest', role: 'survivor', min: 4, max: 9 },
  { id: 'spotter', name: 'Spotter', role: 'adversary', min: 5, max: 8 },
  { id: 'anarchist', name: 'Anarchist', role: 'adversary', min: 5, max: 8 },
  { id: 'dullahan', name: 'Dullahan', role: 'adversary', min: 5, max: 8 },
  { id: 'chronos', name: 'Chronos', role: 'adversary', min: 5, max: 8 },
  { id: 'chaser', name: 'Chaser', role: 'adversary', min: 4, max: 9 },
  { id: 'firework', name: 'Firework', role: 'adversary', min: 4, max: 9 },
  { id: 'flare-reaver', name: 'Flare Reaver', role: 'adversary', min: 4, max: 9 },
  { id: 'executioner', name: 'Executioner', role: 'adversary', min: 2, max: 5 },
  { id: 'sin', name: 'Sin', role: 'adversary', min: 2, max: 5 },
  { id: 'apprentice', name: 'Apprentice', role: 'adversary', min: 3, max: 6 },
  { id: 'hunter', name: 'Hunter', role: 'adversary', min: 3, max: 6 },
  { id: 'custodian', name: 'Custodian', role: 'adversary', min: 3, max: 6 },
];
export function initialState() {
  return {
    schemaVersion: 2,
    types: structuredClone(DEFAULT_TYPES),
    players: [
      { id: 'p1', typeId: 'shielder', username: '', min: 1, max: 4 },
      { id: 'p2', typeId: 'noob', username: '', min: 4, max: 8 },
      { id: 'p3', typeId: 'guest', username: '', min: 4, max: 9 },
      { id: 'p4', typeId: 'spotter', username: '', min: 5, max: 8 },
    ],
    round: 0, queue: [], current: 0,
  };
}
export function validRange(min, max) {
  return Number.isInteger(min) && Number.isInteger(max) && min >= 1 && max <= 999 && min <= max;
}
export function rollRound(players, types, random = Math.random) {
  if (!players.length) throw new Error('Add at least one player before starting a round.');
  const queue = players.map((player, index) => {
    const type = types.find(item => item.id === player.typeId);
    if (!type || !validRange(player.min, player.max)) throw new Error('Check every speed range: use whole numbers from 1 to 999, with minimum no higher than maximum.');
    return { ...player, name: player.username.trim() || `${type.name} ${index + 1}`, typeName: type.name,
      role: type.role, roll: player.min + Math.floor(random() * (player.max - player.min + 1)) };
  });
  // Shuffle first so equal rolls have a fair, random order.
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return queue.sort((a, b) => b.roll - a.roll);
}
export function startRound(state, random = Math.random) {
  return { ...state, round: state.round + 1, current: 0, queue: rollRound(state.players, state.types, random) };
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
  if (!value || !Array.isArray(value.types) || !value.types.length || !Array.isArray(value.players) || !Array.isArray(value.queue)) return false;
  const ids = new Set(value.types.map(type => type.id));
  if (ids.size !== value.types.length || value.types.length > 100 || value.players.length > 32 || value.queue.length > 32) return false;
  if (!value.types.every(type => typeof type.id === 'string' && typeof type.name === 'string' && ['survivor', 'adversary'].includes(type.role) && validRange(type.min, type.max))) return false;
  if (!value.players.every(player => typeof player.id === 'string' && typeof player.username === 'string' && ids.has(player.typeId) && validRange(player.min, player.max))) return false;
  return Number.isInteger(value.round) && value.round >= 0 && Number.isInteger(value.current) && value.current >= 0 && value.current <= value.queue.length && value.queue.every(player => typeof player.name === 'string' && typeof player.typeName === 'string' && typeof player.id === 'string' && ['survivor', 'adversary'].includes(player.role) && validRange(player.min, player.max) && Number.isInteger(player.roll) && player.roll >= player.min && player.roll <= player.max);
}

export function migrateSavedState(value) {
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
