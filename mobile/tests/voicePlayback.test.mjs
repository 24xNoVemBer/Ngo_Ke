import assert from 'node:assert/strict';
import test from 'node:test';
import { restartAudioPlayer, stopAudioPlayer } from '../src/voice/playback.ts';

test('stopping playback pauses immediately without waiting on a native seek', () => {
  const events = [];
  const player = {
    loop: true,
    pause() { events.push('pause'); },
  };

  stopAudioPlayer(player);
  assert.equal(player.loop, false);
  assert.deepEqual(events, ['pause']);
});

test('replay waits for the native seek before starting playback', async () => {
  let finishSeek;
  const events = [];
  const pendingSeek = new Promise((resolve) => { finishSeek = resolve; });
  const player = {
    async seekTo(seconds) {
      events.push(`seek:${seconds}:start`);
      await pendingSeek;
      events.push('seek:finish');
    },
    play() { events.push('play'); },
  };

  const replay = restartAudioPlayer(player, () => true);
  await Promise.resolve();
  assert.deepEqual(events, ['seek:0:start']);

  finishSeek();
  assert.equal(await replay, true);
  assert.deepEqual(events, ['seek:0:start', 'seek:finish', 'play']);
});

test('replay does not resume after its voice scope is canceled during seek', async () => {
  let finishSeek;
  let current = true;
  const player = {
    seekTo: () => new Promise((resolve) => { finishSeek = resolve; }),
    play() { assert.fail('stale audio must not start'); },
  };

  const replay = restartAudioPlayer(player, () => current);
  await Promise.resolve();
  current = false;
  finishSeek();
  assert.equal(await replay, false);
});
