import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getSourceState, type Mode } from './src/data/sourceState';
import { areas, type RootStackParamList } from './src/navigation';
import { CameraScreen } from './src/screens/CameraScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { QaScreen } from './src/screens/QaScreen';
import { UnavailableScreen } from './src/screens/UnavailableScreen';
import { colors } from './src/theme';
import demoData from '../data/demo.json';

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

export default function App(): ReactElement {
  const [mode, setMode] = useState<Mode>('demo');
  const source = getSourceState(mode, demoData);
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerTintColor: colors.accent, headerShadowVisible: false }}>
          <Stack.Screen name="Home" options={{ title: 'Ngõ Kể' }}>
            {(props) => <HomeScreen {...props} mode={mode} source={source} onModeChange={setMode} />}
          </Stack.Screen>
          <Stack.Screen name="Qa" options={{ title: 'Giới thiệu và hỏi đáp' }}>
            {() =>
              source.status === 'ready' ? (
                <QaScreen dataset={source.dataset} />
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
                <CameraScreen nodes={source.dataset.nodes} />
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
