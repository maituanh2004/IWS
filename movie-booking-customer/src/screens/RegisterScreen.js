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
    TouchableOpacity,
    Alert,
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
import Header from '../components/Header';

const STEPS = ['TÀI KHOẢN', 'CÁ NHÂN', 'XÁC MINH'];

const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', colors: ['#333', '#333'] };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: 'Mật khẩu yếu', colors: ['#FF4444', '#FF4444'] };
    if (score <= 3) return { level: 2, label: 'Mật khẩu trung bình', colors: ['#F4C430', '#F4C430'] };
    return { level: 3, label: 'Mật khẩu mạnh ✓', colors: ['#00D4FF', '#4CAF50'] };
};

export default function RegisterScreen({ navigation }) {
    const { signUp } = useAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    const strength = getPasswordStrength(password);

    const validate = () => {
        if (!email.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập email'); return false; }
        if (!phone.trim()) { Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại'); return false; }
        if (password.length < 6) { Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự'); return false; }
        if (password !== confirmPw) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return false; }
        if (!agreed) { Alert.alert('Lỗi', 'Vui lòng đồng ý với Điều khoản dịch vụ'); return false; }
        return true;
    };

    const handleNext = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await signUp('', email, password);
        } catch (error) {
            Alert.alert('Đăng ký thất bại', error.response?.data?.message || 'Vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleSocial = (provider) =>
        Alert.alert('Thông báo', `Đăng ký bằng ${provider} sẽ ra mắt sớm!`);

    return (
        <ScreenWrapper>
            <Header title="CINEVIET" showBack={true} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="h-14" />

                    {/* ── Step Progress ── */}
                    <View className="px-6 mb-4">
                        <View className="h-1 bg-[#1E1E2E] rounded-full mb-3 overflow-hidden">
                            <LinearGradient
                                colors={['#00D4FF', '#6C3483']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                className="h-full"
                                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                            />
                        </View>
                        <View className="flex-row justify-between">
                            {STEPS.map((label, i) => {
                                const isActive = i === currentStep;
                                const isDone = i < currentStep;
                                return (
                                    <View key={label} className="items-center gap-1">
                                        <View className={`w-3.5 h-3.5 rounded-full items-center justify-center ${isActive || isDone ? 'bg-[#00D4FF]' : 'bg-[#1E1E2E] border border-[#333]'}`}>
                                            {isDone && <Ionicons name="checkmark" size={10} color="#0A0A0F" />}
                                        </View>
                                        <Text className={`text-[9px] font-bold tracking-widest ${isActive ? 'text-[#00D4FF]' : 'text-gray-600'}`}>{label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* ── Form Card ── */}
                    <View className="flex-1 bg-[#141420] rounded-t-[32px] px-6 pt-8 pb-10 mt-4">
                        <Text className="text-white text-2xl font-black mb-1">Tạo tài khoản mới 🎬</Text>
                        <Text className="text-gray-500 text-sm mb-7">Bước {currentStep + 1}: {STEPS[currentStep]}</Text>

                        <CustomerInput
                            label="EMAIL"
                            icon="mail-outline"
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <CustomerInput
                            label="SỐ ĐIỆN THOẠI"
                            icon="phone-portrait-outline"
                            placeholder="090 123 4567"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />

                        <View className="relative">
                            <CustomerInput
                                label="MẬT KHẨU"
                                icon="lock-closed-outline"
                                placeholder="••••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPw}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPw(!showPw)}
                                className="absolute right-4 top-10"
                            >
                                <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Strength bar */}
                        {password.length > 0 && (
                            <View className="flex-row items-center gap-2.5 mt-[-12px] mb-4">
                                <View className="flex-1 flex-row gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <View
                                            key={i}
                                            className="flex-1 h-1 rounded-full"
                                            style={{ backgroundColor: i <= strength.level * 1.3 ? strength.colors[0] : '#2A2A3E' }}
                                        />
                                    ))}
                                </View>
                                <Text className="text-[11px] font-bold" style={{ color: strength.colors[1] }}>{strength.label}</Text>
                            </View>
                        )}

                        <View className="relative">
                            <CustomerInput
                                label="XÁC NHẬN MẬT KHẨU"
                                icon="shield-checkmark-outline"
                                placeholder="••••••••••"
                                value={confirmPw}
                                onChangeText={setConfirmPw}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-10"
                            >
                                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
                            </TouchableOpacity>
                        </View>
                        {confirmPw.length > 0 && confirmPw !== password && (
                            <Text className="text-[#FF4444] text-[12px] mt-[-14px] mb-3 ml-1">Mật khẩu không khớp</Text>
                        )}

                        {confirmPw.length > 0 && confirmPw !== password && (
                            <Text className="text-[#FF4444] text-[12px] mt-[-14px] mb-3 ml-1">
                                Mật khẩu không khớp
                            </Text>
                        )}

                        {/* Terms checkbox */}
                        <TouchableOpacity
                            className="flex-row items-start gap-2.5 mb-7"
                            onPress={() => setAgreed(!agreed)}
                            activeOpacity={0.7}
                        >
                            <View className={`w-5 h-5 rounded-md border-1.5 items-center justify-center ${agreed ? 'bg-[#00D4FF] border-[#00D4FF]' : 'bg-[#1E1E2E] border-gray-600'}`}>
                                {agreed && <Ionicons name="checkmark" size={12} color="#0A0A0F" />}
                            </View>
                            <Text className="flex-1 text-gray-500 text-sm leading-5">
                                Tôi đồng ý với <Text className="text-[#00D4FF] font-bold">Điều khoản dịch vụ</Text> và <Text className="text-[#00D4FF] font-bold">Chính sách bảo mật</Text>
                            </Text>
                        </TouchableOpacity>

                        <CustomerButton
                            title="TIẾP THEO"
                            onPress={handleNext}
                            loading={loading}
                        />

                        <View className="flex-row items-center mb-5 gap-2.5">
                            <View className="flex-1 h-[1px] bg-[#1E1E2E]" />
                            <Text className="text-gray-600 text-[10px] font-bold tracking-widest">HOẶC ĐĂNG KÝ VỚI</Text>
                            <View className="flex-1 h-[1px] bg-[#1E1E2E]" />
                        </View>

                        <View className="flex-row gap-3 mb-7">
                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center gap-2.5 h-12 bg-[#1E1E2E] rounded-xl border border-[#2A2A3E]"
                                onPress={() => handleSocial('Facebook')}
                            >
                                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                                <Text className="text-gray-300 text-sm font-semibold">Facebook</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center gap-2.5 h-12 bg-[#1E1E2E] rounded-xl border border-[#2A2A3E]"
                                onPress={() => handleSocial('Google')}
                            >
                                <Text className="text-[#EA4335] text-lg font-black">G</Text>
                                <Text className="text-gray-300 text-sm font-semibold">Google</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-gray-500 text-sm">Đã có tài khoản? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-[#00D4FF] text-sm font-bold">Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
