type RestartablePlayer = {
  seekTo(seconds: number): Promise<void>;
  play(): void;
};

type StoppablePlayer = {
  loop: boolean;
  playing: boolean;
  pause(): void;
};

const PLAYER_STOP_TIMEOUT_MS = 1000;

export function isPlaybackRequestCurrent(
  request: number,
  currentRequest: number,
  scope: string,
  currentScope: string,
): boolean {
  return request === currentRequest && scope === currentScope;
}

export async function stopAudioPlayer(player: StoppablePlayer): Promise<boolean> {
  try {
    player.loop = false;
    player.pause();
    const deadline = Date.now() + PLAYER_STOP_TIMEOUT_MS;
    while (player.playing && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    return !player.playing;
  } catch { /* The player may already be released. */ return false; }
}

export async function restartAudioPlayer(player: RestartablePlayer, isCurrent: () => boolean): Promise<boolean> {
  await player.seekTo(0);
  if (!isCurrent()) return false;
  player.play();
  return true;
}
