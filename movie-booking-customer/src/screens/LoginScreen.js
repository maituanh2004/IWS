import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomerInput from '../components/CustomerInput';
import CustomerButton from '../components/CustomerButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const { t, colors, theme } = useUI();

  const handleLogin = async () => {
    console.log("🔥 CLICK LOGIN");
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log("✅ VALIDATE PASS");

    setLoading(true);

    try {
      console.log("🔥 CALLING signIn...");
      await signIn(email, password);
      console.log("✅ LOGIN SUCCESS");
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.error || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };



  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero Section ── */}
          <View className="h-72 justify-end items-center pb-9 relative overflow-hidden">
            <View className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#0D1520]' : 'bg-[#E0E0E0]'}`}>
              <LinearGradient
                colors={theme === 'dark' ? ['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.85)', '#0A0A0F'] : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.85)', '#F8F9FA']}
                className="absolute inset-0"
              />
            </View>

            <View className="flex-row items-center gap-2.5 mb-2.5">
              <Text className="text-3xl">🎬</Text>
              <Text className={`${theme === 'dark' ? 'text-white' : 'text-[#0A0A0F]'} text-4xl font-black italic tracking-[3px]`}>CINEVIET</Text>
            </View>
            <Text className={`${colors.textSecondary} text-[15px] tracking-wide`}>Your ultimate cinema experience</Text>
          </View>

          {/* ── Form Card ── */}
          <View className={`flex-1 ${colors.card} rounded-t-[32px] px-6 pt-8 pb-10`}>
            <Text className={`${colors.text} text-2xl font-bold mb-1.5`}>{t('welcome')}</Text>
            <Text className={`${colors.textSecondary} text-sm mb-7`}>{t('signin_continue')}</Text>

            <CustomerInput
              label={t('email')}
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            console.log("EMAIL STATE:", email);

            <View className="relative">
              <CustomerInput
                label={t('password')}
                icon="lock-closed-outline"
                placeholder="••••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                className="absolute right-4 top-10"
              >
                <Ionicons
                  name={showPass ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mb-7">
              <TouchableOpacity
                className="flex-row items-center gap-2.5"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View className={`w-5 h-5 rounded-md border-1.5 items-center justify-center ${rememberMe ? 'border-[#00D4FF] bg-[#00D4FF18]' : `${colors.border} ${theme === 'dark' ? 'bg-[#1E1E2E]' : 'bg-gray-100'}`}`}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#00D4FF" />}
                </View>
                <Text className={`${colors.textSecondary} text-sm`}>{t('remember_me')}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}>
                <Text className="text-[#00D4FF] text-sm font-semibold">{t('forgot_password')}</Text>
              </TouchableOpacity>
            </View>

            <CustomerButton
              title={t('signin')}
              onPress={handleLogin}
              loading={loading}
            />

            <View className="flex-row justify-center items-center mb-7">
              <Text className={`${colors.textSecondary} text-sm`}>{t('no_account')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-[#00D4FF] text-sm font-bold">{t('signup')}</Text>
              </TouchableOpacity>
            </View>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
