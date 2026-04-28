import React, { useState } from 'react';
import {
  View,
  Text,
<<<<<<< HEAD
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
=======
  TouchableOpacity,
  Alert,
>>>>>>> FE-admin
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error.response?.data?.error || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert('Thông báo', `Đăng nhập bằng ${provider} sẽ ra mắt sớm!`);
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
            <View className="absolute inset-0 bg-[#0D1520]">
              <LinearGradient
                colors={['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.85)', '#0A0A0F']}
                className="absolute inset-0"
              />
            </View>

            <View className="flex-row items-center gap-2.5 mb-2.5">
              <Text className="text-3xl">🎬</Text>
              <Text className="text-white text-4xl font-black italic tracking-[3px]">CINEVIET</Text>
            </View>
            <Text className="text-gray-400 text-[15px] tracking-wide">Trải nghiệm điện ảnh đỉnh cao</Text>
          </View>

          {/* ── Form Card ── */}
          <View className="flex-1 bg-[#141420] rounded-t-[32px] px-6 pt-8 pb-10">
            <Text className="text-white text-2xl font-bold mb-1.5">Chào mừng trở lại</Text>
            <Text className="text-gray-500 text-sm mb-7">Đăng nhập để tiếp tục</Text>

            <CustomerInput
              label="EMAIL"
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View className="relative">
              <CustomerInput
                label="MẬT KHẨU"
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
                <View className={`w-5 h-5 rounded-md border-1.5 items-center justify-center ${rememberMe ? 'border-[#00D4FF] bg-[#00D4FF18]' : 'border-gray-600 bg-[#1E1E2E]'}`}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#00D4FF" />}
                </View>
                <Text className="text-gray-400 text-sm">Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Tính năng sẽ ra mắt sớm!')}>
                <Text className="text-[#00D4FF] text-sm font-semibold">Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <CustomerButton
              title="ĐĂNG NHẬP"
              onPress={handleLogin}
              loading={loading}
            />

            <View className="flex-row items-center mb-6 gap-2.5">
              <View className="flex-1 h-[1px] bg-[#2A2A3E]" />
              <Text className="text-gray-600 text-xs">hoặc đăng nhập với</Text>
              <View className="flex-1 h-[1px] bg-[#2A2A3E]" />
            </View>

            <View className="flex-row gap-3.5 mb-7">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2.5 h-13 bg-[#1E1E2E] rounded-xl border border-[#2A2A3E]"
                onPress={() => handleSocialLogin('Facebook')}
              >
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                <Text className="text-gray-300 text-sm font-semibold">Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2.5 h-13 bg-[#1E1E2E] rounded-xl border border-[#2A2A3E]"
                onPress={() => handleSocialLogin('Google')}
              >
                <Text className="text-[#EA4335] text-lg font-black">G</Text>
                <Text className="text-gray-300 text-sm font-semibold">Google</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center mb-7">
              <Text className="text-gray-500 text-sm">Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-[#00D4FF] text-sm font-bold">Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="items-center"
              onPress={() => Alert.alert('Thông báo', 'Đăng nhập vân tay sẽ ra mắt sớm!')}
            >
              <View className="w-13 h-13 rounded-full bg-[#1E1E2E] border border-[#2A2A3E] items-center justify-center">
                <Ionicons name="finger-print-outline" size={26} color="#00D4FF" />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
