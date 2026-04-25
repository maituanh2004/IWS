import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]       = useState(false);

  const { signIn } = useAuth();

  // ── Handlers ──────────────────────────────────────────────────────────────
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

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Hero Section ────────────────────────────────────────────── */}
          <View style={styles.hero}>
            {/* Simulated blurred poster background */}
            <View style={styles.posterBg}>
              {/* Dark overlay */}
              <LinearGradient
                colors={['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.85)', '#0A0A0F']}
                style={StyleSheet.absoluteFill}
              />
            </View>

            {/* Logo */}
            <View style={styles.logoRow}>
              <Text style={styles.clapper}>🎬</Text>
              <Text style={styles.logoText}>CINEVIET</Text>
            </View>
            <Text style={styles.tagline}>Trải nghiệm điện ảnh đỉnh cao</Text>
          </View>

          {/* ── Form Card ───────────────────────────────────────────────── */}
          <View style={styles.card}>

            {/* Card Header */}
            <Text style={styles.cardTitle}>Chào mừng trở lại</Text>
            <Text style={styles.cardSub}>Đăng nhập để tiếp tục</Text>

            {/* EMAIL field */}
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* MẬT KHẨU field */}
            <Text style={styles.fieldLabel}>MẬT KHẨU</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••••"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPass ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Remember me + Forgot */}
            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#00D4FF" />}
                </View>
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Alert.alert('Thông báo', 'Tính năng sẽ ra mắt sớm!')}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.loginBtnWrapper}
            >
              <LinearGradient
                colors={['#00D4FF', '#6C3483']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.loginBtnInner}>
                    <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc đăng nhập với</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialLogin('Facebook')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialLogin('Google')}
                activeOpacity={0.7}
              >
                {/* Google "G" using colored text */}
                <View style={styles.googleIcon}>
                  <Text style={styles.googleG}>G</Text>
                </View>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>

            {/* Fingerprint */}
            <TouchableOpacity
              style={styles.fingerprintBtn}
              onPress={() => Alert.alert('Thông báo', 'Đăng nhập vân tay sẽ ra mắt sớm!')}
              activeOpacity={0.7}
            >
              <View style={styles.fingerprintCircle}>
                <Ionicons name="finger-print-outline" size={26} color="#00D4FF" />
              </View>
            </TouchableOpacity>

          </View>
          {/* end card */}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    height: 280,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  posterBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1520', // dark teal-ish simulating a blurred poster
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  clapper: {
    fontSize: 32,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 3,
  },
  tagline: {
    color: '#AAAAAA',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // ── Form Card ─────────────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: '#141420',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardSub: {
    color: '#888',
    fontSize: 14,
    marginBottom: 28,
  },

  // ── Field ─────────────────────────────────────────────────────────────────
  fieldLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 54,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 4,
  },

  // ── Remember / Forgot ──────────────────────────────────────────────────────
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#555',
    backgroundColor: '#1E1E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#00D4FF',
    backgroundColor: '#00D4FF18',
  },
  rememberText: {
    color: '#AAAAAA',
    fontSize: 13,
  },
  forgotText: {
    color: '#00D4FF',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Login Button ──────────────────────────────────────────────────────────
  loginBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loginBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A3E',
  },
  dividerText: {
    color: '#666',
    fontSize: 12,
  },

  // ── Social ────────────────────────────────────────────────────────────────
  socialRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 28,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  socialText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  googleIcon: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA4335',
  },

  // ── Register link ─────────────────────────────────────────────────────────
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  registerText: {
    color: '#888',
    fontSize: 14,
  },
  registerLink: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Fingerprint ───────────────────────────────────────────────────────────
  fingerprintBtn: {
    alignItems: 'center',
  },
  fingerprintCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E1E2E',
    borderWidth: 1,
    borderColor: '#2A2A3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});