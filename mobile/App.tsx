import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadLiveSource, readLiveConfig } from './src/data/live';
import { getSourceState, type Mode, type SourceState } from './src/data/sourceState';
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
import { voiceCatalogueRevision } from './src/voice/catalog';
import type { PlanDraft } from './src/recommendation/pick';
import demoData from '../data/demo.json';
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

export default function App(): ReactElement {
  const motion = useMotionPreferences();
  const [routeName, setRouteName] = useState('Prologue');
  const [mode, setMode] = useState<Mode>('demo');
  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>();
  const [confirmedNodeId, setConfirmedNodeId] = useState<string | undefined>();
  const [readNodeIds, setReadNodeIds] = useState<ReadonlySet<string>>(new Set());
  const [planDraft, setPlanDraft] = useState<PlanDraft>({});
  const [liveSource, setLiveSource] = useState<SourceState>(() => getSourceState('live'));
  const [liveBusy, setLiveBusy] = useState(false);
  const [liveRevision, setLiveRevision] = useState(0);

  // Live always comes from the backend; it never borrows the demo fixture.
  useEffect(() => {
    if (mode !== 'live') {
      setLiveBusy(false);
      return;
    }
    let cancelled = false;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    setLiveBusy(true);
    loadLiveSource({ baseUrl: liveBaseUrl, signal: controller?.signal }).then((next) => {
      if (!cancelled && !controller?.signal.aborted) {
        setLiveSource(next);
        setCurrentNodeId(undefined);
        setConfirmedNodeId(undefined);
        setReadNodeIds(new Set());
        setLiveBusy(false);
      }
    });
    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [mode, liveRevision]);

  const retryLive = useCallback(() => {
    if (!liveBusy) {
      setLiveBusy(true);
      setLiveRevision((revision) => revision + 1);
    }
  }, [liveBusy]);

  const source = mode === 'demo' ? getSourceState(mode, demoData) : liveSource;
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
      setLiveSource(getSourceState('live'));
      setLiveBusy(true);
    }
    setCurrentNodeId(undefined);
    setConfirmedNodeId(undefined);
    setReadNodeIds(new Set());
    setPlanDraft({});
  };
  const lightStatusBar = routeName === 'Prologue' || routeName === 'Landing' || routeName === 'AlleySelect'
    || ((routeName === 'Home' || routeName === 'Qa') && source.status === 'ready');
  return (
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
            {(props) => <PrologueScreen {...props} />}
          </Stack.Screen>

          {/* TẦNG 1: LANDING PAGE CHÍNH MỞ LỐI */}
          <Stack.Screen
            name="Landing"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'fade' }}
          >
            {(props) => <LandingScreen {...props} mode={mode} nodeCount={source.status === 'ready' ? source.dataset.nodes.length : 0} />}
          </Stack.Screen>

          {/* TẦNG 2: PAGE CHỌN VỊ TRÍ / CHỌN CON NGÕ */}
          <Stack.Screen
            name="AlleySelect"
            options={{ headerShown: false, animation: motion.reducedMotion ? 'none' : 'slide_from_right' }}
          >
            {(props) => <AlleySelectScreen {...props} mode={mode} nodeCount={source.status === 'ready' ? source.dataset.nodes.length : 0} />}
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
                currentNodeId={activeNodeId}
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
                  dataset={source.dataset}
                  datasetRevision={mode === 'demo' ? voiceCatalogueRevision : `live-${liveRevision}`}
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
                <UnavailableScreen detail={source.detail} onBack={() => props.navigation.goBack()} onSwitchToDemo={() => { changeMode('demo'); props.navigation.goBack(); }} />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Plan" options={{ title: 'Chọn trải nghiệm' }}>
            {(props) =>
              source.status === 'ready' ? (
                <PlanScreen mode={mode} nodes={source.dataset.nodes} draft={planDraft} onDraftChange={setPlanDraft} onSelectNode={(nodeId) => {
                  selectNode(nodeId);
                  if (props.route.params?.fromQa) props.navigation.popTo('Qa');
                  else props.navigation.replace('Qa');
                }} />
              ) : (
                <UnavailableScreen detail={source.detail} />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Camera" options={{ title: 'Camera và người kể' }}>
            {() =>
              source.status === 'ready' ? (
                <CameraScreen nodes={source.dataset.nodes} onConfirmNode={confirmNode} />
              ) : (
                <UnavailableScreen detail={source.detail} />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Location" options={{ title: 'Xác nhận điểm GPS' }}>
            {() =>
              source.status === 'ready' && activeNodeId !== undefined ? (
                <LocationScreen
                  nodes={source.dataset.nodes}
                  currentNodeId={confirmedNodeId}
                  onConfirmNode={confirmNode}
                />
              ) : (
                <UnavailableScreen detail={source.detail} />
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
  );
}
