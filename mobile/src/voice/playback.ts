type RestartablePlayer = {
  seekTo(seconds: number): Promise<void>;
  play(): void;
};

type StoppablePlayer = {
  loop: boolean;
  pause(): void;
};

export function stopAudioPlayer(player: StoppablePlayer): void {
  try {
    player.loop = false;
    player.pause();
  } catch { /* The player may already be released. */ }
}

export async function restartAudioPlayer(player: RestartablePlayer, isCurrent: () => boolean): Promise<boolean> {
  await player.seekTo(0);
  if (!isCurrent()) return false;
  player.play();
  return true;
}
