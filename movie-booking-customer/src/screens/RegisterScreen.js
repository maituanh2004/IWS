import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomerInput from '../components/CustomerInput';
import CustomerButton from '../components/CustomerButton';
import Header from '../components/Header';


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


    // States
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);


    const strength = getPasswordStrength(password);


    const colors = {
        card: 'bg-[#0A0A0F]',
        text: 'text-white',
        textSecondary: 'text-gray-400'
    };


    const validate = () => {
        if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return false; }
        if (!name.trim()) { Alert.alert('Error', 'Please enter your full name'); return false; }
        if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return false; }
        if (password !== confirmPw) { Alert.alert('Error', 'Passwords do not match'); return false; }
        return true;
    };


    const handleRegister = async () => {
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


    return (
        <ScreenWrapper>
            <Header title="CINEVIET" showBack={true} />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View className="h-8" />


                    <View className={`flex-1 ${colors.card} rounded-t-[32px] px-6 pt-8 pb-10 mt-4`}>
                        <Text className={`${colors.text} text-2xl font-black mb-1`}>
                            Create Account
                        </Text>
                        <Text className={`${colors.textSecondary} text-sm mb-7`}>
                            Join CineViet today
                        </Text>


                        <CustomerInput
                            label="FULL NAME"
                            icon="person-outline"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />


                        <CustomerInput
                            label="EMAIL"
                            icon="mail-outline"
                            placeholder="example@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />


                        <View className="relative">
                            <CustomerInput
                                label="PASSWORD"
                                icon="lock-closed-outline"
                                placeholder="••••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPw}
                            />
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
                            <CustomerInput
                                label="CONFIRM PASSWORD"
                                icon="shield-checkmark-outline"
                                placeholder="••••••••••"
                                value={confirmPw}
                                onChangeText={setConfirmPw}
                                secureTextEntry={!showConfirm}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-10">
                                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color="#666" />
                            </TouchableOpacity>
                        </View>


                        {confirmPw.length > 0 && confirmPw !== password && (
                            <Text className="text-[#FF4444] text-[12px] mt-[-14px] mb-3 ml-1">Passwords do not match</Text>
                        )}






                        <CustomerButton title="REGISTER" onPress={handleRegister} loading={loading} />


                        <View className="flex-row justify-center items-center mt-6">
                            <Text className={`${colors.textSecondary} text-sm`}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text className="text-[#00D4FF] text-sm font-bold">Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}