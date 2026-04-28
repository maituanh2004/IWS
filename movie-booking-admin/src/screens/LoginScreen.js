import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            console.log("🔵 SENDING LOGIN REQUEST...");

            const result = await signIn(email, password);

            console.log("🟢 LOGIN SUCCESS:", result);
            Alert.alert("Success", "Login successful!");

        } catch (error) {
            console.log("🔴 LOGIN ERROR RAW:", error);

            if (error.response) {
                console.log("🔴 SERVER RESPONSE:", error.response.data);

                const message =
                    error.response.data?.error ||
                    error.response.data?.message ||
                    "Invalid email or password";

                Alert.alert("Login Failed", message);
            }
            else if (error.request) {
                console.log("🔴 REQUEST ERROR:", error.request);
                Alert.alert("Network Error", "Cannot reach the server");
            }
            else {
                console.log("🔴 UNKNOWN ERROR:", error.message);
                Alert.alert("Error", error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View className="flex-1 justify-center p-6 bg-[#0a0a0a]">
                <View className="bg-[#1a1a1a] p-10 rounded-[40px] shadow-2xl border border-white/5">
                    <Text className="text-4xl font-black text-white text-center mb-2 tracking-tighter italic">ADMIN</Text>
                    <Text className="text-sm text-[#c04444] text-center mb-12 font-black uppercase tracking-[4px]">Movie System</Text>

                    <View className="mb-6">
                        <Text className="text-xs font-black text-gray-500 mb-3 ml-1 uppercase tracking-widest">Email Address</Text>
                        <TextInput
                            className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 focus:border-[#c04444]"
                            placeholder="admin@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            placeholderTextColor="#4b5563"
                        />
                    </View>

                    <View className="mb-10">
                        <Text className="text-xs font-black text-gray-500 mb-3 ml-1 uppercase tracking-widest">Security Code</Text>
                        <TextInput
                            className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 focus:border-[#c04444]"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#4b5563"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-[#c04444] p-5 rounded-2xl items-center shadow-2xl active:opacity-90 overflow-hidden"
                        style={{ shadowColor: '#c04444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 }}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-lg font-black uppercase tracking-widest">Authorize Access</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}