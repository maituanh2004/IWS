import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomerInput from '../components/CustomerInput';
import CustomerButton from '../components/CustomerButton';
import Header from '../components/Header';

const STEPS = ['ACCOUNT', 'PERSONAL', 'VERIFY'];

const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', colors: ['#333', '#333'] };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak password', colors: ['#FF4444', '#FF4444'] };
    if (score <= 3) return { level: 2, label: 'Medium strength', colors: ['#F4C430', '#F4C430'] };
    return { level: 3, label: 'Strong password ✓', colors: ['#00D4FF', '#4CAF50'] };
};

export default function RegisterScreen({ navigation }) {
    const { signUp } = useAuth();
    const [currentStep] = useState(0);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const strength = getPasswordStrength(password);

    const validate = () => {
        if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return false; }
        if (!name.trim()) { Alert.alert('Error', 'Please enter your full name'); return false; }
        if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return false; }
        if (password !== confirmPw) { Alert.alert('Error', 'Passwords do not match'); return false; }
        if (!agreed) { Alert.alert('Error', 'Please agree to the Terms of Service'); return false; }
        return true;
    };

    const handleNext = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await signUp(name, email, password);
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Please try again');
        } finally {
            setLoading(false);
        }
    };

    const handleSocial = (provider) =>
        Alert.alert('Coming Soon', `Sign up with ${provider} will be available soon!`);

    return (
        <ScreenWrapper>
            <Header title="CINEVIET" showBack={true} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View className="h-14" />
                    {/* Step Progress */}
                    <View className="px-6 mb-4">
                        <View className="h-1 bg-[#1E1E2E] rounded-full mb-3 overflow-hidden">
                            <LinearGradient colors={['#00D4FF', '#6C3483']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="h-full" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
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
                    {/* Form Card */}
                    <View className="flex-1 bg-[#121212] rounded-t-[32px] px-6 pt-8 pb-10 mt-4">
                        <Text className="text-white text-2xl font-black mb-1">
                        Create Account
                        </Text>
                        <Text className="text-gray-400 text-sm mb-7">Step {currentStep + 1}: {STEPS[currentStep]}</Text>

                        <CustomerInput label={('email')} icon="mail-outline" placeholder="example@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <CustomerInput label={('full_name')} icon="person-outline" placeholder="John Doe" value={name} onChangeText={setName} autoCapitalize="words" />

                        <View className="relative">
                            <CustomerInput label={('password')} icon="lock-closed-outline" placeholder="••••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPw} />
                            <TouchableOpacity onPress={() => setShowPw(!showPw)} className="absolute right-4 top-10">
                                <Ionicons name={showPw ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {password.length > 0 && (
                            <View className="flex-row items-center gap-2.5 mt-[-12px] mb-4">
                                <View className="flex-1 flex-row gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <View key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i <= strength.level * 1.3 ? strength.colors[0] : '#2A2A3E' }} />
                                    ))}
                                </View>
                                <Text className="text-[11px] font-bold" style={{ color: strength.colors[1] }}>{strength.label}</Text>
                            </View>
                        )}

                        <View className="relative">
                            <CustomerInput label="CONFIRM PASSWORD" icon="shield-checkmark-outline" placeholder="••••••••••" value={confirmPw} onChangeText={setConfirmPw} secureTextEntry={!showConfirm} />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-10">
                                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
                            </TouchableOpacity>
                        </View>
                        {confirmPw.length > 0 && confirmPw !== password && (
                            <Text className="text-[#FF4444] text-[12px] mt-[-14px] mb-3 ml-1">Passwords do not match</Text>
                        )}

                        <TouchableOpacity className="flex-row items-start gap-2.5 mb-7" onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
                            <View className={`w-5 h-5 rounded-md border-1.5 items-center justify-center ${agreed ? 'bg-[#00D4FF] border-[#00D4FF]' : 'bg-[#1E1E2E] border-gray-600'}`}>
                                {agreed && <Ionicons name="checkmark" size={12} color="#0A0A0F" />}
                            </View>
                            <Text className="flex-1 text-gray-500 text-sm leading-5">
                                I agree to the <Text className="text-[#00D4FF] font-bold">Terms of Service</Text> and <Text className="text-[#00D4FF] font-bold">Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        <CustomerButton title="CONTINUE" onPress={handleNext} loading={loading} />

                        <View className="flex-row justify-center items-center">
                            <Text className="text-gray-400 text-sm">
                                Already have an account? 
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-[#00D4FF] text-sm font-bold">
                                    Sign in
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
