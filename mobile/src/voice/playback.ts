type RestartablePlayer = {
  seekTo(seconds: number): Promise<void>;
  play(): void;
};

type StoppablePlayer = {
  loop: boolean;
  pause(): void;
  seekTo(seconds: number): Promise<void>;
};

export function isPlaybackRequestCurrent(
  request: number,
  currentRequest: number,
  scope: string,
  currentScope: string,
): boolean {
  return request === currentRequest && scope === currentScope;
}

export async function stopAudioPlayer(player: StoppablePlayer): Promise<void> {
  try {
    player.loop = false;
    player.pause();
    await player.seekTo(0);
  } catch { /* The player may already be released. */ }
}

export async function restartAudioPlayer(player: RestartablePlayer, isCurrent: () => boolean): Promise<boolean> {
  await player.seekTo(0);
  if (!isCurrent()) return false;
  player.play();
  return true;
}
