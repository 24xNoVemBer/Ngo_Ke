type RestartablePlayer = {
  seekTo(seconds: number): Promise<void>;
  play(): void;
};

export async function restartAudioPlayer(player: RestartablePlayer, isCurrent: () => boolean): Promise<boolean> {
  await player.seekTo(0);
  if (!isCurrent()) return false;
  player.play();
  return true;
}
