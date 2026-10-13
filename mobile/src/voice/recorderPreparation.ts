type RecorderPreparation<T> = {
  isCurrent: () => boolean;
  enableAudioMode: () => Promise<void>;
  recordingOptions: T;
  prepareRecorder: (options: T) => Promise<void>;
  stopRecorder: () => Promise<void>;
  removeRecording: () => void;
  disableAudioMode: () => Promise<void>;
};

export async function startVoiceRecorder(
  record: () => void,
  isRecording: () => boolean,
  isCurrent: () => boolean,
  stopRecorder: () => Promise<void>,
): Promise<boolean> {
  record();
  for (let elapsed = 0; elapsed <= 1000; elapsed += 50) {
    if (!isCurrent()) {
      try { await stopRecorder(); } catch { /* The canceled recorder may already be inactive. */ }
      return false;
    }
    if (isRecording()) return true;
    if (elapsed < 1000) await new Promise((resolve) => setTimeout(resolve, 50));
  }
  try { await stopRecorder(); } catch { /* Clear a recorder that failed to start cleanly. */ }
  throw new Error('RECORDER_START_FAILED');
}

async function discardPreparedRecorder<T>(options: RecorderPreparation<T>): Promise<void> {
  try { await options.stopRecorder(); } catch { /* The native recorder may already have reset itself. */ }
  try { options.removeRecording(); } finally {
    try { await options.disableAudioMode(); } catch { /* Keep cancellation best-effort if the session is already inactive. */ }
  }
}

export async function prepareVoiceRecorderForTurn<T>(options: RecorderPreparation<T>): Promise<boolean> {
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
    await options.prepareRecorder(options.recordingOptions);
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
