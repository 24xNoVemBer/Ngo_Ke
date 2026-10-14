export function shouldCancelVoiceOnAppStateChange(
  state: string,
  permissionPending: boolean,
): boolean {
  return !permissionPending && (state === 'background' || state === 'inactive');
}

export function canContinueVoiceStart(state: string): boolean {
  return state === 'active';
}

export function shouldCancelVoiceOnScopeChange(previousScope: string, nextScope: string): boolean {
  return previousScope !== nextScope;
}

export function isCurrentVoiceTurn(
  active: { turnId: string; scope: string } | null,
  activeScope: string,
  expected: { turnId: string; scope: string },
): boolean {
  return active?.turnId === expected.turnId && active.scope === expected.scope && activeScope === expected.scope;
}
