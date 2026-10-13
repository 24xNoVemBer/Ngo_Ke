import assert from 'node:assert/strict';
import test from 'node:test';
import { isPlaybackRequestCurrent, restartAudioPlayer, stopAudioPlayer } from '../src/voice/playback.ts';

test('answer playback generation is invalidated by a new mic turn or scope change', () => {
  assert.equal(isPlaybackRequestCurrent(4, 4, 'demo:r1:demo-01', 'demo:r1:demo-01'), true);
  assert.equal(isPlaybackRequestCurrent(4, 5, 'demo:r1:demo-01', 'demo:r1:demo-01'), false);
  assert.equal(isPlaybackRequestCurrent(4, 4, 'demo:r1:demo-01', 'demo:r1:demo-02'), false);
});

test('stopping playback pauses immediately and waits for the native rewind', async () => {
  let finishSeek;
  const events = [];
  const pendingSeek = new Promise((resolve) => { finishSeek = resolve; });
  const player = {
    loop: true,
    pause() { events.push('pause'); },
    async seekTo(seconds) {
      events.push(`seek:${seconds}:start`);
      await pendingSeek;
      events.push('seek:finish');
    },
  };

  let stopped = false;
  const stopping = stopAudioPlayer(player).then(() => { stopped = true; });
  await Promise.resolve();
  assert.equal(player.loop, false);
  assert.deepEqual(events, ['pause', 'seek:0:start']);
  assert.equal(stopped, false);

  finishSeek();
  await stopping;
  assert.equal(stopped, true);
  assert.deepEqual(events, ['pause', 'seek:0:start', 'seek:finish']);
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
