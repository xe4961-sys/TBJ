import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, validRange, rollRound, startRound, nextTurn, updateType, isSavedState, DEFAULT_TYPES, migrateSavedState } from '../game.js';

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

test('all 26 requested presets use the confirmed names, roles, and ranges', () => {
  const groups = [
    ['survivor', 4, 8, ['Noob', 'Jester', 'Firefighter', 'Hemomancer']],
    ['survivor', 2, 6, ['Knight', 'Brawler', 'Sheriff', 'Maniac']],
    ['survivor', 2, 5, ['Sniper', 'Doc', 'Vocalist']],
    ['survivor', 1, 4, ['Shielder', 'Wrecker']],
    ['survivor', 4, 9, ['Guest']],
    ['adversary', 5, 8, ['Spotter', 'Anarchist', 'Dullahan', 'Chronos']],
    ['adversary', 4, 9, ['Chaser', 'Firework', 'Flare Reaver']],
    ['adversary', 2, 5, ['Executioner', 'Sin']],
    ['adversary', 3, 6, ['Apprentice', 'Hunter', 'Custodian']],
  ];
  assert.equal(DEFAULT_TYPES.length, 26);
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
  assert.equal(migrated.types.length, 27);
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
