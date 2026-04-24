/**
 * RegisterScreen.js
 *
 * Requires:
 *   npx expo install expo-linear-gradient
 */

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

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = ['TÀI KHOẢN', 'CÁ NHÂN', 'XÁC MINH'];

// ─── Password strength ────────────────────────────────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: [] };
  let score = 0;
  if (pw.length >= 6)                      score++;
  if (pw.length >= 10)                     score++;
  if (/[A-Z]/.test(pw))                    score++;
  if (/[0-9]/.test(pw))                    score++;
  if (/[^A-Za-z0-9]/.test(pw))            score++;

  if (score <= 1) return { level: 1, label: 'Mật khẩu yếu',   colors: ['#FF4444', '#FF4444'] };
  if (score <= 3) return { level: 2, label: 'Mật khẩu trung bình', colors: ['#F4C430', '#F4C430'] };
  return          { level: 3, label: 'Mật khẩu mạnh ✓',  colors: ['#00D4FF', '#4CAF50'] };
};

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0); // 0 = Tài khoản
  const [name,        setName]        = useState('');
  const [email,        setEmail]       = useState('');
  const [phone,        setPhone]       = useState('');
  const [password,     setPassword]    = useState('');
  const [confirmPw,    setConfirmPw]   = useState('');
  const [showPw,       setShowPw]      = useState(false);
  const [showConfirm,  setShowConfirm] = useState(false);
  const [agreed,       setAgreed]      = useState(false);
  const [loading,      setLoading]     = useState(false);

  const strength = getPasswordStrength(password);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    if (!name.trim())    { Alert.alert('Lỗi', 'Vui lòng nhập họ và tên'); return false; }
    if (!email.trim())   { Alert.alert('Lỗi', 'Vui lòng nhập email'); return false; }
    if (!phone.trim())   { Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại'); return false; }
    if (password.length < 6) { Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự'); return false; }
    if (password !== confirmPw) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return false; }
    if (!agreed) { Alert.alert('Lỗi', 'Vui lòng đồng ý với Điều khoản dịch vụ'); return false; }
    return true;
  };

  // ── Handle next / submit ───────────────────────────────────────────────────
  const handleNext = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(name, email, password); 
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.response?.data?.message || 'Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider) =>
    Alert.alert('Thông báo', `Đăng ký bằng ${provider} sẽ ra mắt sớm!`);

  // ── Step progress bar ──────────────────────────────────────────────────────
  const StepBar = () => (
    <View style={styles.stepContainer}>
      {/* Track line */}
      <View style={styles.stepTrack}>
        <LinearGradient
          colors={['#00D4FF', '#6C3483']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.stepFill, { width: `${((currentStep + 0.5) / STEPS.length) * 100}%` }]}
        />
      </View>

      {/* Dots + labels */}
      <View style={styles.stepDots}>
        {STEPS.map((label, i) => {
          const done   = i < currentStep;
          const active = i === currentStep;
          return (
            <View key={label} style={styles.stepDotCol}>
              <View style={[
                styles.stepDot,
                active && styles.stepDotActive,
                done   && styles.stepDotDone,
              ]}>
                {done && <Ionicons name="checkmark" size={10} color="#0A0A0F" />}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  // ── Password strength bar ──────────────────────────────────────────────────
  const StrengthBar = () => (
    <View style={styles.strengthRow}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthSegment,
              i <= strength.level * 1.3 && { backgroundColor: strength.colors?.[0] ?? '#333' },
            ]}
          />
        ))}
      </View>
      {strength.label ? (
        <Text style={[styles.strengthLabel, { color: strength.colors?.[1] ?? '#888' }]}>
          {strength.label}
        </Text>
      ) : null}
    </View>
  );

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.logo}>CINEVIET</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero spacer ── */}
          <View style={styles.heroSpace} />

          {/* ── Step bar ── */}
          <StepBar />

          {/* ── Form card ── */}
          <View style={styles.card}>

            {/* Title */}
            <Text style={styles.cardTitle}>Tạo tài khoản mới 🎬</Text>
            <Text style={styles.cardSub}>Bước 1: Thông tin đăng nhập</Text>

            {/* HỌ VÀ TÊN */}
            <Text style={styles.fieldLabel}>HỌ VÀ TÊN</Text>
            <View style={styles.inputBox}>
              <Ionicons name="person-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#444"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* EMAIL */}
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#444"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            {/* SỐ ĐIỆN THOẠI */}
            <Text style={styles.fieldLabel}>SỐ ĐIỆN THOẠI</Text>
            <View style={styles.inputBox}>
              {/* Country prefix */}
              <View style={styles.phonePrefixBox}>
                <Text style={styles.flagEmoji}>🇻🇳</Text>
                <Text style={styles.prefixText}>+84</Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </View>
              <View style={styles.phoneDivider} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="090 123 4567"
                placeholderTextColor="#444"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            {/* MẬT KHẨU */}
            <Text style={styles.fieldLabel}>MẬT KHẨU</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••••"
                placeholderTextColor="#444"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Password strength */}
            {password.length > 0 && <StrengthBar />}

            {/* XÁC NHẬN MẬT KHẨU */}
            <Text style={styles.fieldLabel}>XÁC NHẬN MẬT KHẨU</Text>
            <View style={[
              styles.inputBox,
              confirmPw && confirmPw !== password && styles.inputBoxError,
            ]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••••"
                placeholderTextColor="#444"
                value={confirmPw}
                onChangeText={setConfirmPw}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
              </TouchableOpacity>
            </View>
            {confirmPw.length > 0 && confirmPw !== password && (
              <Text style={styles.errorHint}>Mật khẩu không khớp</Text>
            )}

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={12} color="#0A0A0F" />}
              </View>
              <Text style={styles.termsText}>
                Tôi đồng ý với{' '}
                <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
                {' '}và{' '}
                <Text style={styles.termsLink}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            {/* CTA button */}
            <TouchableOpacity
              onPress={handleNext}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.ctaWrapper}
            >
              <LinearGradient
                colors={['#00D4FF', '#6C3483']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ctaBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.ctaInner}>
                    <Text style={styles.ctaText}>TIẾP THEO</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC ĐĂNG KÝ VỚI</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocial('Facebook')}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocial('Google')}
                activeOpacity={0.7}
              >
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* end card */}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },

  // ── Top bar ──────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0A0A0F',
  },
  backBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  logo: {
    color: '#00D4FF', fontSize: 18, fontWeight: '900',
    letterSpacing: 3, fontStyle: 'italic',
  },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scroll: { flexGrow: 1 },
  heroSpace: { height: 60 },

  // ── Step bar ─────────────────────────────────────────────────────────────────
  stepContainer: { paddingHorizontal: 24, marginBottom: 0 },
  stepTrack: {
    height: 4, backgroundColor: '#1E1E2E',
    borderRadius: 2, marginBottom: 10, overflow: 'hidden',
  },
  stepFill: { height: '100%', borderRadius: 2 },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stepDotCol: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#1E1E2E',
    borderWidth: 1.5, borderColor: '#333',
    justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#00D4FF', borderColor: '#00D4FF',
    shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
  },
  stepDotDone: { backgroundColor: '#00D4FF', borderColor: '#00D4FF' },
  stepLabel: {
    color: '#444', fontSize: 9, fontWeight: '700', letterSpacing: 0.5,
  },
  stepLabelActive: { color: '#00D4FF' },

  // ── Form card ─────────────────────────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: '#141420',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    marginTop: 16,
  },
  cardTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  cardSub:   { color: '#777', fontSize: 13, marginBottom: 24 },

  // ── Field ────────────────────────────────────────────────────────────────────
  fieldLabel: {
    color: '#666', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    paddingHorizontal: 14, height: 52,
    marginBottom: 18,
    borderWidth: 1, borderColor: '#2A2A3E',
  },
  inputBoxError: { borderColor: '#FF4444' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  eyeBtn: { padding: 4 },

  // Phone prefix
  phonePrefixBox: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingRight: 10,
  },
  flagEmoji: { fontSize: 18 },
  prefixText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  phoneDivider: { width: 1, height: 24, backgroundColor: '#2A2A3E', marginRight: 10 },

  // Error hint
  errorHint: { color: '#FF4444', fontSize: 12, marginTop: -14, marginBottom: 12 },

  // ── Strength bar ──────────────────────────────────────────────────────────────
  strengthRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginTop: -12, marginBottom: 16,
  },
  strengthBars: { flexDirection: 'row', gap: 5, flex: 1 },
  strengthSegment: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#2A2A3E',
  },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 100, textAlign: 'right' },

  // ── Terms ────────────────────────────────────────────────────────────────────
  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 10, marginBottom: 24,
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#555',
    backgroundColor: '#1E1E2E',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#00D4FF', borderColor: '#00D4FF' },
  termsText: { flex: 1, color: '#999', fontSize: 13, lineHeight: 20 },
  termsLink: { color: '#00D4FF', fontWeight: '600' },

  // ── CTA ──────────────────────────────────────────────────────────────────────
  ctaWrapper: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
    shadowColor: '#00D4FF', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  ctaBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  ctaInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 2 },

  // ── Divider ───────────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1E1E2E' },
  dividerText: { color: '#555', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // ── Social ────────────────────────────────────────────────────────────────────
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    height: 50, backgroundColor: '#1E1E2E',
    borderRadius: 12, borderWidth: 1, borderColor: '#2A2A3E',
  },
  socialText: { color: '#CCCCCC', fontSize: 14, fontWeight: '600' },
  googleG:    { color: '#EA4335', fontSize: 18, fontWeight: '900' },

  // ── Login link ────────────────────────────────────────────────────────────────
  loginRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  loginText: { color: '#777', fontSize: 14 },
  loginLink: { color: '#00D4FF', fontSize: 14, fontWeight: '700' },
});