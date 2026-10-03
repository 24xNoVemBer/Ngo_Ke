import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadLiveSource, readLiveConfig } from './src/data/live';
import { getSourceState, type Mode, type SourceState } from './src/data/sourceState';
import { areas, type RootStackParamList } from './src/navigation';
import { CameraScreen } from './src/screens/CameraScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LocationScreen } from './src/screens/LocationScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { QaScreen } from './src/screens/QaScreen';
import { UnavailableScreen } from './src/screens/UnavailableScreen';
import { colors } from './src/theme';
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
  process.env,
  appConfig.expo.extra as Record<string, unknown> | undefined,
);

export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>('demo');
  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>();
  const [liveSource, setLiveSource] = useState<SourceState>(() => getSourceState('live'));
  const [liveBusy, setLiveBusy] = useState(false);

  // Live always comes from the backend; it never borrows the demo fixture.
  useEffect(() => {
    if (mode !== 'live' || liveBusy) {
      return;
    }
    let cancelled = false;
    loadLiveSource({ baseUrl: liveBaseUrl }).then((next) => {
      if (!cancelled) {
        setLiveSource(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, liveBusy]);

  const retryLive = useCallback(() => {
    setLiveBusy(true);
    setLiveBusy(false);
  }, []);

  const source = mode === 'demo' ? getSourceState(mode, demoData) : liveSource;
  // Only the user can move the current point: GPS suggests, the user confirms.
  const activeNodeId = source.status === 'ready'
    ? (currentNodeId ?? source.dataset.startNodeId)
    : undefined;
  const confirmNode = (nodeId: string): void => setCurrentNodeId(nodeId);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerTintColor: colors.accent, headerShadowVisible: false }}>
          <Stack.Screen name="Home" options={{ title: 'Ngõ Kể' }}>
            {(
              props
            ) => (
              <HomeScreen
                {...props}
                mode={mode}
                source={source}
                onModeChange={setMode}
                currentNodeId={activeNodeId}
                liveBusy={liveBusy}
                onRetryLive={retryLive}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Qa" options={{ title: 'Giới thiệu và hỏi đáp' }}>
            {() =>
              source.status === 'ready' ? (
                <QaScreen dataset={source.dataset} currentNodeId={activeNodeId} />
              ) : (
                <UnavailableScreen detail={source.detail} />
              )
            }
          </Stack.Screen>
          <Stack.Screen name="Plan" options={{ title: 'Chọn trải nghiệm' }}>
            {() =>
              source.status === 'ready' ? (
                <PlanScreen nodes={source.dataset.nodes} />
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
                  currentNodeId={activeNodeId}
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
  );
}
