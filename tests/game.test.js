import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validRange, rollRound, startRound, nextTurn, updateType, isSavedState, DEFAULT_TYPES, migrateSavedState, effectiveRange, addSpeedEffect, removeSpeedEffect, validEffect } from '../game.js';

test('rolls use inclusive player ranges and sort fastest first', () => {
  const state = initialState();
  const low = rollRound(state.players, state.types, () => 0);
  assert.deepEqual(low.map(player => player.roll), [5, 4, 4, 1]);
  assert.ok(low.every(player => player.roll === player.min));
  const high = rollRound(state.players, state.types, () => 0.999999);
  assert.deepEqual(high.map(player => player.roll), [9, 8, 8, 4]);
  assert.ok(high.every(player => player.roll === player.max));
});
test('equal rolls are shuffled without losing participants', () => {
  const state = initialState();
  const players = state.players.map(player => ({ ...player, min: 4, max: 4 }));
  const queue = rollRound(players, state.types, () => 0);
  assert.deepEqual(new Set(queue.map(player => player.id)), new Set(players.map(player => player.id)));
  assert.notDeepEqual(queue.map(player => player.id), players.map(player => player.id));
});
test('round counter increases on play only; turns stop after final player', () => {
  let state = startRound(initialState(), () => .5);
  assert.equal(state.round, 1);
  const originalQueue = structuredClone(state.queue);
  for (let i = 0; i < 7; i++) state = nextTurn(state);
  assert.equal(state.current, 4);
  assert.equal(state.round, 1);
  assert.deepEqual(state.queue, originalQueue);
  state = startRound(state, () => 0);
  assert.equal(state.round, 2);
  assert.equal(state.current, 0);
});
test('roster changes do not rewrite the round in progress', () => {
  const state = startRound(initialState(), () => .5);
  state.players[0].username = 'Changed';
  state.players.pop();
  assert.equal(state.queue.length, 4);
  assert.notEqual(state.queue.find(player => player.id === 'p1').name, 'Changed');
  const next = startRound(state, () => .5);
  assert.equal(next.queue.length, 3);
  assert.equal(next.queue.find(player => player.id === 'p1').name, 'Changed');
});
test('type defaults update default players and preserve custom ranges', () => {
  const state = initialState();
  state.players.push({ id: 'custom', typeId: 'shielder', username: 'Tank', min: 2, max: 9 });
  const updated = updateType(state, 'shielder', { min: 2, max: 6 });
  assert.equal(updated.players[0].max, 6);
  assert.equal(updated.players.at(-1).max, 9);
  assert.equal(state.types.find(type => type.id === 'shielder').max, 4);
});
test('invalid ranges and empty rosters cannot start a round', () => {
  for (const range of [[-1, 5], [7, 2], [1.5, 5], [1, 1000], [NaN, 5]]) assert.equal(validRange(...range), false);
  assert.equal(validRange(0, 0), false);
  assert.equal(validRange(1, 1), true);
  assert.throws(() => rollRound([], []), /at least one/);
  const state = initialState();
  state.players[0].min = 8;
  assert.throws(() => startRound(state), /speed range/);
});
test('saved data validates setup and in-progress rounds', () => {
  assert.equal(isSavedState(null), false);
  assert.equal(isSavedState({}), false);
  assert.equal(isSavedState(initialState()), true);
  const state = startRound(initialState());
  assert.equal(isSavedState(JSON.parse(JSON.stringify(state))), true);
  state.queue[0].roll = 1000;
  assert.equal(isSavedState(state), false);
});

test('all 27 requested presets use the confirmed names, roles, and ranges', () => {
  const groups = [
    ['survivor', 4, 8, ['Noob', 'Jester', 'Firefighter', 'Hemomancer', 'Vocalist', 'Assistant']],
    ['survivor', 3, 7, ['Knight', 'Brawler', 'Sheriff', 'Maniac']],
    ['survivor', 2, 5, ['Sniper', 'Doc']],
    ['survivor', 1, 4, ['Shielder', 'Wrecker']],
    ['survivor', 4, 9, ['Guest']],
    ['adversary', 5, 8, ['Spotter', 'Anarchist', 'Dullahan', 'Chronos']],
    ['adversary', 6, 9, ['Chaser', 'Firework', 'Flare Reaver']],
    ['adversary', 2, 5, ['Executioner', 'Sin']],
    ['adversary', 3, 6, ['Apprentice', 'Hunter', 'Custodian']],
  ];
  assert.equal(DEFAULT_TYPES.length, 27);
  for (const [role, min, max, names] of groups) {
    for (const name of names) {
      const type = DEFAULT_TYPES.find(item => item.name === name);
      assert.ok(type, name);
      assert.deepEqual([type.role, type.min, type.max], [role, min, max]);
    }
  }
});
test('existing sessions gain presets while retaining usernames, custom ranges, and current order', () => {
  const legacy = {
    types: [
      { id: 'shielder', name: 'Shielder', role: 'survivor', min: 1, max: 5 },
      { id: 'noob', name: 'Noob', role: 'survivor', min: 2, max: 7 },
      { id: 'scout', name: 'Scout', role: 'survivor', min: 3, max: 8 },
      { id: 'stalker', name: 'Stalker', role: 'killer', min: 3, max: 8 },
      { id: 'custom', name: 'Custom', role: 'killer', min: 0, max: 2 },
    ],
    players: [
      { id: 'p1', typeId: 'shielder', username: 'Tank', min: 1, max: 5 },
      { id: 'p2', typeId: 'noob', username: 'Fast', min: 6, max: 10 },
      { id: 'p3', typeId: 'scout', username: '', min: 3, max: 8 },
      { id: 'p4', typeId: 'stalker', username: '', min: 3, max: 8 },
    ],
    round: 3, current: 1,
    queue: [{ id: 'p4', name: 'Stalker', typeName: 'Stalker', role: 'killer', min: 3, max: 8, roll: 6 }],
  };
  const migrated = migrateSavedState(legacy);
  assert.equal(isSavedState(migrated), true);
  assert.equal(migrated.types.length, 28);
  assert.equal(migrated.players[0].username, 'Tank');
  assert.equal(migrated.players[0].max, 4);
  assert.deepEqual([migrated.players[1].min, migrated.players[1].max], [6, 10]);
  assert.equal(migrated.players[2].typeId, 'guest');
  assert.equal(migrated.players[3].min, 5);
  assert.equal(migrated.types.find(type => type.id === 'custom').min, 1);
  assert.equal(migrated.queue[0].role, 'adversary');
  assert.equal(migrated.round, 3);
  assert.equal(migrated.current, 1);
  assert.deepEqual(migrateSavedState(migrated), migrated);
  assert.equal(legacy.types[4].min, 0);
});

const effect = (id, kind = 'haste', amount = 2, roundsRemaining = 2, label = '') => ({ id, kind, amount, roundsRemaining, label });

test('Haste and Bind stack on both ends of a player’s base range', () => {
  let state = initialState();
  state.players[3] = { ...state.players[3], typeId: 'hunter', min: 3, max: 6 };
  state = addSpeedEffect(state, 'p4', effect('h1'));
  state = addSpeedEffect(state, 'p4', effect('h2', 'haste', 1));
  state = addSpeedEffect(state, 'p4', effect('b1', 'bind', 1));
  assert.deepEqual(effectiveRange(state.players[3]), { min: 5, max: 8, modifier: 2 });
  const queue = rollRound(state.players, state.types, () => 0);
  const hunter = queue.find(player => player.id === 'p4');
  assert.equal(hunter.roll, 5);
  assert.equal(hunter.baseMin, 3);
  assert.equal(hunter.baseMax, 6);
  assert.equal(state.players[3].min, 3);
  assert.equal(state.types.find(type => type.id === 'hunter').max, 6);
  assert.equal(queue.find(player => player.id === 'p1').min, 1);
});
test('a two-round effect applies to exactly two round rolls, never individual turns', () => {
  let state = addSpeedEffect(initialState(), 'p1', effect('h'));
  state = startRound(state, () => 0);
  assert.equal(state.players[0].effects[0].roundsRemaining, 1);
  assert.equal(state.queue.find(player => player.id === 'p1').min, 3);
  assert.equal(state.queue.find(player => player.id === 'p1').effects[0].roundsRemaining, 2);
  for (let i = 0; i < 4; i++) state = nextTurn(state);
  assert.equal(state.players[0].effects[0].roundsRemaining, 1);
  state = startRound(state, () => 0);
  assert.equal(state.players[0].effects.length, 0);
  assert.equal(state.queue.find(player => player.id === 'p1').min, 3);
  assert.equal(state.queue.find(player => player.id === 'p1').effects.length, 1);
  state = startRound(state, () => 0);
  assert.equal(state.queue.find(player => player.id === 'p1').min, 1);
});
test('mid-round effects apply on the next roll without changing current results', () => {
  let state = startRound(initialState(), () => 0);
  const before = structuredClone(state.queue);
  state = addSpeedEffect(state, 'p1', effect('h', 'haste', 2, 1));
  assert.deepEqual(state.queue, before);
  assert.equal(state.players[0].effects[0].roundsRemaining, 1);
  state = startRound(state, () => 0);
  assert.equal(state.queue.find(player => player.id === 'p1').min, 3);
  assert.equal(state.players[0].effects.length, 0);
});
test('conditional effects persist until removed and removal applies next round', () => {
  let state = addSpeedEffect(initialState(), 'p4', effect('passive', 'haste', 3, null, 'Armor shed'));
  for (let i = 0; i < 5; i++) state = startRound(state, () => 0);
  assert.equal(state.players[3].effects[0].roundsRemaining, null);
  const current = structuredClone(state.queue);
  state = removeSpeedEffect(state, 'p4', 'passive');
  assert.equal(state.players[3].effects.length, 0);
  assert.deepEqual(state.queue, current);
  state = startRound(state, () => 0);
  assert.equal(state.queue.find(player => player.id === 'p4').min, 5);
});
test('net effects clamp to 1–999 after stacking, never producing zero', () => {
  const player = { min: 1, max: 4, effects: [effect('bind', 'bind', 4), effect('haste')] };
  assert.deepEqual(effectiveRange(player), { min: 1, max: 2, modifier: -2 });
  assert.deepEqual(effectiveRange({ ...player, effects: [effect('bind', 'bind', 999)] }), { min: 1, max: 1, modifier: -999 });
  assert.deepEqual(effectiveRange({ min: 998, max: 999, effects: [effect('haste')] }), { min: 999, max: 999, modifier: 2 });
});
test('applied effects are independent snapshots, including after a save and reload', () => {
  let state = addSpeedEffect(initialState(), 'p1', effect('h', 'haste', 2, 3));
  state.soundMuted = true;
  state = startRound(state, () => 0);
  state = migrateSavedState(JSON.parse(JSON.stringify(state)));
  assert.equal(isSavedState(state), true);
  assert.equal(state.soundMuted, true);
  assert.equal(state.players[0].effects[0].roundsRemaining, 2);
  state.players[0].effects[0].amount = 8;
  assert.equal(state.queue.find(player => player.id === 'p1').effects[0].amount, 2);
  assert.equal(state.queue.find(player => player.id === 'p1').min, 3);
});
test('invalid effect amounts, durations, duplicate IDs, and expired saved effects are rejected', () => {
  const state = initialState();
  for (const invalid of [effect('x', 'haste', 0), effect('x', 'bind', -2), effect('x', 'haste', 2.5), effect('x', 'haste', 2, 0), effect('x', 'haste', 2, 100), effect('x', 'invalid')]) {
    assert.equal(validEffect(invalid), false);
    assert.throws(() => addSpeedEffect(state, 'p1', invalid));
  }
  const applied = addSpeedEffect(state, 'p1', effect('h'));
  assert.throws(() => addSpeedEffect(applied, 'p1', effect('h')), /already exists/);
  applied.players[0].effects[0].roundsRemaining = 0;
  assert.equal(isSavedState(applied), false);
  assert.throws(() => startRound(applied), /speed effects/);
});
test('a failed roll leaves effect durations and the round counter untouched', () => {
  const state = addSpeedEffect(initialState(), 'p1', effect('h'));
  state.players[0].max = 0;
  assert.throws(() => startRound(state));
  assert.equal(state.players[0].effects[0].roundsRemaining, 2);
  assert.equal(state.round, 0);
});
test('version 2 saves gain Assistant and patched defaults without resetting custom ranges or the round', () => {
  const old = initialState();
  old.schemaVersion = 2;
  delete old.soundMuted;
  old.types = old.types.filter(type => type.id !== 'assistant').map(type => {
    if (['knight', 'brawler', 'sheriff', 'maniac'].includes(type.id)) return { ...type, min: 2, max: 6 };
    if (type.id === 'vocalist') return { ...type, min: 2, max: 5 };
    if (['chaser', 'firework', 'flare-reaver'].includes(type.id)) return { ...type, min: 4, max: 9 };
    return type;
  });
  old.players = [
    { id: 'p1', typeId: 'knight', username: 'Knight player', min: 2, max: 6 },
    { id: 'p2', typeId: 'knight', username: 'Custom knight', min: 5, max: 10 },
    { id: 'p3', typeId: 'vocalist', username: '', min: 2, max: 5 },
    { id: 'p4', typeId: 'chaser', username: '', min: 4, max: 9 },
  ];
  old.queue = [{ id: 'p1', name: 'Knight player', typeName: 'Knight', role: 'survivor', min: 2, max: 6, roll: 4 }];
  old.round = 3;
  const migrated = migrateSavedState(old);
  assert.equal(isSavedState(migrated), true);
  assert.equal(migrated.types.length, 27);
  assert.equal(migrated.types.find(type => type.id === 'assistant').min, 4);
  assert.deepEqual([migrated.players[0].min, migrated.players[0].max], [3, 7]);
  assert.deepEqual([migrated.players[1].min, migrated.players[1].max], [5, 10]);
  assert.deepEqual([migrated.players[2].min, migrated.players[2].max], [4, 8]);
  assert.deepEqual([migrated.players[3].min, migrated.players[3].max], [6, 9]);
  assert.equal(migrated.players[0].username, 'Knight player');
  assert.equal(migrated.queue[0].min, 2);
  assert.equal(migrated.round, 3);
  assert.deepEqual(migrateSavedState(migrated), migrated);
});
