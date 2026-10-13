type RecorderPreparation = {
  isCurrent: () => boolean;
  enableAudioMode: () => Promise<void>;
  prepareRecorder: () => Promise<void>;
  stopRecorder: () => Promise<void>;
  removeRecording: () => void;
  disableAudioMode: () => Promise<void>;
};

async function discardPreparedRecorder(options: RecorderPreparation): Promise<void> {
  try { await options.stopRecorder(); } catch { /* The native recorder may already have reset itself. */ }
  try { options.removeRecording(); } finally {
    try { await options.disableAudioMode(); } catch { /* Keep cancellation best-effort if the session is already inactive. */ }
  }
}

export async function prepareVoiceRecorderForTurn(options: RecorderPreparation): Promise<boolean> {
  try {
    await options.enableAudioMode();
  } catch (error) {
    if (options.isCurrent()) throw error;
    try { await options.disableAudioMode(); } catch { /* The canceled turn must not proceed. */ }
    return false;
  }

  if (!options.isCurrent()) {
    try { await options.disableAudioMode(); } catch { /* The canceled turn must not proceed. */ }
    return false;
  }

  try {
    await options.prepareRecorder();
  } catch (error) {
    await discardPreparedRecorder(options);
    if (options.isCurrent()) throw error;
    return false;
  }

  if (!options.isCurrent()) {
    await discardPreparedRecorder(options);
    return false;
  }
  return true;
}
