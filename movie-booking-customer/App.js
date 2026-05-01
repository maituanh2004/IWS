import 'react-native-reanimated';
import './global.css';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { UIProvider } from './src/context/UIContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppContent />
        <StatusBar style="auto" />
      </UIProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { loading } = useAuth();

  const linking = {
    prefixes: ['moviebooking://'],
    config: {
      screens: {
        PaymentSuccess: {
          path: 'payment-success',
          parse: {
            bookingGroupId: (id) => `${id}`,
            status: (s) => `${s}`,
          },
        },
      },
    },
  };

  if (loading) return null;

  return (
    <NavigationContainer linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  );
}
