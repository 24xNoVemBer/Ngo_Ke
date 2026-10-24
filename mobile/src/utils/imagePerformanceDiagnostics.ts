declare const __DEV__: boolean;
declare const process: { env: { EXPO_PUBLIC_NGOKE_PERF01?: string } };

export type ImagePerfScreen = 'landing' | 'alley-select' | 'home' | 'qa';

interface NavigationTap {
  id: number;
  at: number;
  from: ImagePerfScreen;
  to: ImagePerfScreen;
  key?: string;
}

interface ScreenFocus {
  at: number;
  navigationTap?: NavigationTap;
}

interface ImageLoad {
  at: number;
  loaded: boolean;
  failed: boolean;
}

const pendingNavigation = new Map<ImagePerfScreen, NavigationTap>();
const screenFocus = new Map<ImagePerfScreen, ScreenFocus>();
const imageLoads = new Map<string, ImageLoad>();
let nextNavigationId = 1;

function isEnabled(): boolean {
  return typeof __DEV__ !== 'undefined'
    && __DEV__
    && process.env.EXPO_PUBLIC_NGOKE_PERF01 === '1';
}

function now(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function emit(event: string, fields: Record<string, unknown> = {}): void {
  if (!isEnabled()) return;
  console.info(`[NGOKE_PERF01] ${JSON.stringify({ event, at_ms: Math.round(now()), ...fields })}`);
}

export function recordImagePerfNavigationTap(
  from: ImagePerfScreen,
  to: ImagePerfScreen,
  key?: string,
): void {
  if (!isEnabled()) return;
  const tap: NavigationTap = { id: nextNavigationId++, at: now(), from, to, key };
  pendingNavigation.set(to, tap);
  emit('navigation_tap', { navigation_id: tap.id, from, to, ...(key ? { key } : {}) });
}

export function recordImagePerfScreenFocus(screen: ImagePerfScreen): void {
  if (!isEnabled()) return;
  const at = now();
  const tap = pendingNavigation.get(screen);
  if (tap) pendingNavigation.delete(screen);
  screenFocus.set(screen, { at, navigationTap: tap });
  emit('navigation_focus', {
    screen,
    ...(tap ? { navigation_id: tap.id, tap_to_focus_ms: Math.round(at - tap.at) } : {}),
  });
}

export function createImagePerfFirstLayoutReporter(screen: ImagePerfScreen): () => void {
  let reported = false;
  return () => {
    if (!isEnabled() || reported) return;
    reported = true;
    const at = now();
    const focus = screenFocus.get(screen);
    const tap = focus?.navigationTap ?? pendingNavigation.get(screen);
    emit('first_layout', {
      screen,
      ...(focus ? { focus_to_layout_ms: Math.round(at - focus.at) } : {}),
      ...(tap ? { navigation_id: tap.id, tap_to_layout_ms: Math.round(at - tap.at) } : {}),
    });
  };
}

export function recordImagePerfLoadStart(screen: ImagePerfScreen, image: string): void {
  if (!isEnabled()) return;
  const at = now();
  imageLoads.set(`${screen}:${image}`, { at, loaded: false, failed: false });
  const focus = screenFocus.get(screen);
  emit('image_load_start', {
    screen,
    image,
    ...(focus ? { focus_to_image_start_ms: Math.round(at - focus.at) } : {}),
  });
}

export function recordImagePerfLoadSuccess(screen: ImagePerfScreen, image: string): void {
  if (!isEnabled()) return;
  const load = imageLoads.get(`${screen}:${image}`);
  if (load) load.loaded = true;
}

export function recordImagePerfLoadError(screen: ImagePerfScreen, image: string): void {
  if (!isEnabled()) return;
  const load = imageLoads.get(`${screen}:${image}`);
  if (load) load.failed = true;
  emit('image_load_error', { screen, image });
}

export function recordImagePerfLoadEnd(screen: ImagePerfScreen, image: string): void {
  if (!isEnabled()) return;
  const at = now();
  const key = `${screen}:${image}`;
  const load = imageLoads.get(key);
  if (load) imageLoads.delete(key);
  emit('image_load_end', {
    screen,
    image,
    result: load ? (load.failed ? 'error' : load.loaded ? 'success' : 'unknown') : 'start_not_observed',
    ...(load ? { load_ms: Math.round(at - load.at) } : {}),
  });
}
