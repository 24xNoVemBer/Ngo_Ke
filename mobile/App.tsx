import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { loadLiveSourceV2, readLiveConfig } from './src/data/live';
import { getSourceState, type Mode, type SourceState } from './src/data/sourceState';
import * as Crypto from 'expo-crypto';
import { areas, type RootStackParamList } from './src/navigation';
import { AlleySelectScreen } from './src/screens/AlleySelectScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LandingScreen } from './src/screens/LandingScreen';
import { LocationScreen } from './src/screens/LocationScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { PrologueScreen } from './src/screens/PrologueScreen';
import { QaScreen } from './src/screens/QaScreen';
import { UnavailableScreen } from './src/screens/UnavailableScreen';
import { MotionProvider, useMotionPreferences } from './src/hooks/MotionPreferences';
import { colors } from './src/theme';
import { readVoiceApiBaseUrl } from './src/voice/config';
import type { PlanDraft } from './src/recommendation/pick';
import { LocaleProvider, type LocaleContextValue } from './src/context/LocaleContext';
import { type Locale } from './src/data/locale';
import {
  DEFAULT_COLLECTION_ID,
  getBundledDataset,
  getCollectionRevision,
  type CollectionId,
} from './src/data/collections';
import {
  readPersistedLocaleAsync,
  writePersistedLocaleAsync,
  resolveEffectiveLocale,
} from './src/data/localeStorage';
import { t } from './src/i18n/translator';
import appConfig from './app.json';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
  },
};

// app.json is the fallback; the environment variable wins so each environment
// can point elsewhere without a code change.
const liveBaseUrl = readLiveConfig(
  { EXPO_PUBLIC_NGOKE_API_BASE_URL: process.env.EXPO_PUBLIC_NGOKE_API_BASE_URL },
  appConfig.expo.extra as Record<string, unknown> | undefined,
);
const voiceApiBaseUrl = readVoiceApiBaseUrl(
  { EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL: process.env.EXPO_PUBLIC_NGOKE_VOICE_API_BASE_URL },
  appConfig.expo.extra as Record<string, unknown> | undefined,
);

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro statically analyzable sound asset
const PROLOGUE_WATERDROP_SOUND = require('./assets/sounds/prologue_waterdrop.wav');

export default function App(): ReactElement {
  const motion = useMotionPreferences();
  const startSoundPlayer = useAudioPlayer(PROLOGUE_WATERDROP_SOUND, { downloadFirst: true });
  const [routeName, setRouteName] = useState('Prologue');
  const [locale, setLocaleState] = useState<Locale>(() => resolveEffectiveLocale(undefined));
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const manualChoiceRef = useRef(false);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const [collectionId, setCollectionIdState] = useState<CollectionId>(DEFAULT_COLLECTION_ID);
  const collectionIdRef = useRef(collectionId);
  collectionIdRef.current = collectionId;

  const [mode, setMode] = useState<Mode>('demo');
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>();
  const [confirmedNodeId, setConfirmedNodeId] = useState<string | undefined>();
  const [readNodeIds, setReadNodeIds] = useState<ReadonlySet<string>>(new Set());
  const [planDraft, setPlanDraft] = useState<PlanDraft>({});
  const [liveSource, setLiveSource] = useState<SourceState>(() => getSourceState('live', undefined, locale));
  const [liveBusy, setLiveBusy] = useState(false);
  const [liveRevision, setLiveRevision] = useState(0);
  const liveRevisionRef = useRef(liveRevision);
  liveRevisionRef.current = liveRevision;

  useEffect(() => {
    let cancelled = false;
    readPersistedLocaleAsync().then((saved) => {
      if (!cancelled) {
        if (!manualChoiceRef.current && saved) {
          setLocaleState(saved);
        }
        setIsLocaleReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    manualChoiceRef.current = true;
    setLocaleState(next);
    // Synchronously hide old locale liveSource so EN never renders VI while request pending
    setLiveSource(getSourceState('live', undefined, next));
    void writePersistedLocaleAsync(next);
  }, []);

  const setCollectionId = useCallback((next: CollectionId) => {
    setCollectionIdState(next);
  }, []);

  // Logical node is preserved on locale change; reset only on incompatible collection change.
  useEffect(() => {
    setCurrentNodeId(undefined);
    setConfirmedNodeId(undefined);
    setReadNodeIds(new Set());
    setPlanDraft({});
  }, [collectionId]);

  // Live always comes from the backend; it never borrows the demo fixture.
  // Direct V2 request only, enforcing cancellation and rejecting stale results.
  useEffect(() => {
    if (mode !== 'live') {
      setLiveBusy(false);
      return;
    }
    let cancelled = false;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    setLiveBusy(true);

    const requestLocale = locale;
    const requestMode = mode;
    const requestCollectionId = collectionId;
    const requestLiveRevision = liveRevision;

    loadLiveSourceV2({
      baseUrl: liveBaseUrl,
      locale: requestLocale,
      signal: controller?.signal,
      digestImpl: async (text: string) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text),
    })
      .then((next) => {
        if (
          !cancelled &&
          !controller?.signal.aborted &&
          localeRef.current === requestLocale &&
          modeRef.current === requestMode &&
          collectionIdRef.current === requestCollectionId &&
          liveRevisionRef.current === requestLiveRevision
        ) {
          setLiveSource(next as unknown as SourceState);
          setLiveBusy(false);
        }
      });

    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [mode, liveRevision, locale, collectionId]);

  const retryLive = useCallback(() => {
    if (!liveBusy) {
      setLiveBusy(true);
      setLiveRevision((revision) => revision + 1);
    }
  }, [liveBusy]);

  const source = mode === 'demo'
    ? getSourceState(mode, getBundledDataset(collectionId, locale), locale)
    : (liveSource.status === 'ready' && 'locale' in liveSource.dataset && liveSource.dataset.locale && liveSource.dataset.locale !== locale)
      ? getSourceState('live', undefined, locale)
      : liveSource;
  // Viewing a story does not confirm the user's physical location.
  const activeNodeId = source.status === 'ready'
    ? (source.dataset.nodes.find((node) => node.id === currentNodeId && node.available)?.id
      ?? source.dataset.nodes.find((node) => node.id === source.dataset.startNodeId && node.available)?.id
      ?? source.dataset.nodes.find((node) => node.available)?.id)
    : undefined;
  const selectNode = (nodeId: string): void => {
    if (source.status === 'ready' && source.dataset.nodes.some((node) => node.id === nodeId && node.available)) {
      setCurrentNodeId(nodeId);
    }
  };
  const confirmNode = (nodeId: string): void => {
    if (source.status === 'ready' && source.dataset.nodes.some((node) => node.id === nodeId && node.available)) {
      setConfirmedNodeId(nodeId);
      setCurrentNodeId(nodeId);
    }
  };
  const markRead = useCallback((nodeId: string): void => {
    setReadNodeIds((previous) => previous.has(nodeId) ? previous : new Set([...previous, nodeId]));
  }, []);
  const changeMode = (next: Mode): void => {
    if (next === mode) return;
    setMode(next);
    if (next === 'live') {
      setLiveSource(getSourceState('live', undefined, locale));
      setLiveBusy(true);
    }
    setCurrentNodeId(undefined);
    setConfirmedNodeId(undefined);
    setReadNodeIds(new Set());
    setPlanDraft({});
  };
  const lightStatusBar = routeName === 'Prologue' || routeName === 'Landing'
    || ((routeName === 'Home' || routeName === 'Qa') && source.status === 'ready');

  const localeContextValue: LocaleContextValue = {
    locale,
    setLocale,
    collectionId,
    setCollectionId,
    isReady: isLocaleReady,
    t: (key, params) => t(locale, key, params),
  };

  return (
    <LocaleProvider value={localeContextValue}>
    <MotionProvider value={motion}>
    <SafeAreaProvider>
      {/* Expo Go on iOS uses application-level status bar control. */}
      <StatusBar barStyle={lightStatusBar ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        theme={navigationTheme}
        onStateChange={(state) => {
          const name = state?.routes[state.index ?? 0]?.name;
          if (name) setRouteName(name);
        }}
      >
        <Stack.Navigator
          initialRouteName="Prologue"
          screenOptions={{
            animation: motion.reducedMotion ? 'none' : 'slide_from_right',
            animationDuration: 240,
            gestureEnabled: true,
            headerTintColor: colors.accent,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: {
              fontWeight: '700',
              color: colors.text,
            },
          }}
        >
          {/* TẦNG 0: MÀN HÌNH MỞ ĐẦU / PROLOGUE - GIỚI THIỆU TÊN NGÕ KỂ */}
          <Stack.Screen
            name="Prologue"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'fade' }}
          >
            {(props) => <PrologueScreen {...props} player={startSoundPlayer} />}
          </Stack.Screen>

          {/* TẦNG 1: LANDING PAGE CHÍNH MỞ LỐI */}
          <Stack.Screen
            name="Landing"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'fade' }}
          >
            {(props) => (
              <LandingScreen
                {...props}
                mode={mode}
                source={source}
                onModeChange={changeMode}
                nodeCount={source.status === 'ready' ? source.dataset.nodes.length : 0}
                liveBusy={liveBusy}
                onRetryLive={retryLive}
              />
            )}
          </Stack.Screen>

          {/* TẦNG 2: PAGE CHỌN VỊ TRÍ / CHỌN CON NGÕ */}
          <Stack.Screen
            name="AlleySelect"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'slide_from_right' }}
          >
            {(props) => (
              <AlleySelectScreen
                {...props}
                mode={mode}
                nodeCount={source.status === 'ready' ? source.dataset.nodes.length : 0}
                liveSource={liveSource}
                liveBusy={liveBusy}
                onRetryLive={retryLive}
              />
            )}
          </Stack.Screen>

          {/* TẦNG 3: BẢN ĐỒ CON NGÕ ĐÃ CHỌN */}
          <Stack.Screen
            name="Home"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'slide_from_right' }}
          >
            {(
              props
            ) => (
              <HomeScreen
                {...props}
                mode={mode}
                source={source}
                onModeChange={changeMode}
                currentNodeId={currentNodeId}
                onSelectNode={selectNode}
                readNodeIds={readNodeIds}
                liveBusy={liveBusy}
                onRetryLive={retryLive}
              />
            )}
          </Stack.Screen>

          {/* TẦNG 4: TRONG CON NGÕ - TỪNG ĐIỂM TRẠM */}
          <Stack.Screen
            name="Qa"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'slide_from_right' }}
          >
            {(props) =>
              source.status === 'ready' && activeNodeId !== undefined ? (
                <QaScreen
                  key={`${mode}:${liveRevision}:${activeNodeId}`}
                  mode={mode}
                  source={source}
                  onModeChange={changeMode}
                  liveBusy={liveBusy}
                  onRetryLive={retryLive}
                  dataset={source.dataset}
                  datasetRevision={
                    mode === 'demo'
                      ? getCollectionRevision(collectionId, locale)
                      : (source.status === 'ready' && 'revision' in source && typeof source.revision === 'string'
                          ? source.revision
                          : `live-${liveRevision}`)
                  }
                  voiceApiBaseUrl={voiceApiBaseUrl}
                  currentNodeId={activeNodeId}
                  onSelectNode={selectNode}
                  onReadNode={markRead}
                  readNodeIds={readNodeIds}
                  planDraft={planDraft}
                  onPlanDraftChange={setPlanDraft}
                  onOpenNotebook={(draft) => {
                    if (draft) setPlanDraft(draft);
                    props.navigation.navigate('Plan', { fromQa: true });
                  }}
                  onOpenCamera={() => props.navigation.navigate('Camera')}
                  onOpenLocation={() => props.navigation.navigate('Location')}
                  onBack={() => props.navigation.goBack()}
                />
              ) : (
                <UnavailableScreen detail={source.detail} onBack={() => props.navigation.goBack()} onSwitchToDemo={() => { changeMode('demo'); props.navigation.goBack(); }} onRetry={mode === 'live' ? retryLive : undefined} busy={liveBusy} />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Plan" options={{ title: t(locale, 'plan.title') }}>
            {(props) =>
              source.status === 'ready' ? (
                <PlanScreen
                  mode={mode}
                  nodes={source.dataset.nodes}
                  draft={planDraft}
                  onDraftChange={setPlanDraft}
                  collectionKind={'kind' in source.dataset && source.dataset.kind === 'reviewed' ? 'reviewed' : 'simulated'}
                  onSelectNode={(nodeId) => {
                    selectNode(nodeId);
                    if (props.route.params?.fromQa) props.navigation.popTo('Qa');
                    else props.navigation.replace('Qa');
                  }}
                />
              ) : (
                <UnavailableScreen
                  detail={source.detail}
                  onBack={() => props.navigation.goBack()}
                  onSwitchToDemo={() => { changeMode('demo'); props.navigation.goBack(); }}
                  onRetry={mode === 'live' ? retryLive : undefined}
                  busy={liveBusy}
                />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Camera" options={{ title: t(locale, 'camera.title') }}>
            {(props) =>
              source.status === 'ready' ? (
                <CameraScreen
                  nodes={source.dataset.nodes}
                  onConfirmNode={confirmNode}
                  collectionKind={'kind' in source.dataset && source.dataset.kind === 'reviewed' ? 'reviewed' : 'simulated'}
                  collectionId={'collectionId' in source.dataset && typeof source.dataset.collectionId === 'string' ? source.dataset.collectionId : undefined}
                />
              ) : (
                <UnavailableScreen
                  detail={source.detail}
                  onBack={() => props.navigation.goBack()}
                  onSwitchToDemo={() => { changeMode('demo'); props.navigation.goBack(); }}
                  onRetry={mode === 'live' ? retryLive : undefined}
                  busy={liveBusy}
                />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Location" options={{ title: t(locale, 'location.title') }}>
            {(props) =>
              source.status === 'ready' && activeNodeId !== undefined ? (
                <LocationScreen
                  nodes={source.dataset.nodes}
                  currentNodeId={confirmedNodeId}
                  onConfirmNode={confirmNode}
                  collectionKind={'kind' in source.dataset && source.dataset.kind === 'reviewed' ? 'reviewed' : 'simulated'}
                  collectionId={'collectionId' in source.dataset && typeof source.dataset.collectionId === 'string' ? source.dataset.collectionId : undefined}
                />
              ) : (
                <UnavailableScreen
                  detail={source.detail}
                  onBack={() => props.navigation.goBack()}
                  onSwitchToDemo={() => { changeMode('demo'); props.navigation.goBack(); }}
                  onRetry={mode === 'live' ? retryLive : undefined}
                  busy={liveBusy}
                />
              )
            }
          </Stack.Screen>
          <Stack.Screen
            name="Placeholder"
            component={PlaceholderScreen}
            options={({ route }) => ({ title: areas[route.params.area].title })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </MotionProvider>
    </LocaleProvider>
  );
}
