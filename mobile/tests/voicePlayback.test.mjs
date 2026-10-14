import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { isPlaybackRequestCurrent, restartAudioPlayer, stopAudioPlayer } from '../src/voice/playback.ts';

test('answer playback generation is invalidated by a new mic turn or scope change', () => {
  assert.equal(isPlaybackRequestCurrent(4, 4, 'demo:r1:demo-01', 'demo:r1:demo-01'), true);
  assert.equal(isPlaybackRequestCurrent(4, 5, 'demo:r1:demo-01', 'demo:r1:demo-01'), false);
  assert.equal(isPlaybackRequestCurrent(4, 4, 'demo:r1:demo-01', 'demo:r1:demo-02'), false);
});

test('stopping playback disables looping, pauses and awaits the native seek before returning', async () => {
  const events = [];
  let playing = true;
  const player = {
    loop: true,
    get playing() { return playing; },
    pause() {
      events.push('pause');
    },
    async seekTo(seconds) {
      events.push(`seek:${seconds}:start`);
      await delay(40);
      playing = false;
      events.push('seek:finish');
    },
  };

  assert.equal(await stopAudioPlayer(player), true);
  assert.equal(player.loop, false);
  assert.deepEqual(events, ['pause', 'seek:0:start', 'seek:finish']);
});

test('stopping playback reports when the native player never pauses', async () => {
  const player = {
    loop: true,
    playing: true,
    pause() {},
    async seekTo() {},
  };

  assert.equal(await stopAudioPlayer(player), false);
});

test('a failed seek still waits for the native pause before allowing microphone handoff', async () => {
  let playing = true;
  const events = [];
  const player = {
    loop: true,
    get playing() { return playing; },
    pause() { void delay(40).then(() => { playing = false; }); },
    async seekTo() { events.push('seek failed'); throw new Error('no current item'); },
  };

  assert.equal(await stopAudioPlayer(player), true);
  assert.deepEqual(events, ['seek failed']);
});

test('a stalled native seek is bounded and proceeds only after playback is paused', async () => {
  const player = {
    loop: true,
    playing: true,
    pause() { this.playing = false; },
    seekTo() { return new Promise(() => {}); },
  };

  assert.equal(await stopAudioPlayer(player), true);
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
