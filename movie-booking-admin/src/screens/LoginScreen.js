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
            <View className="flex-1 justify-center p-5 bg-gray-50">
                <View className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <Text className="text-4xl font-extrabold text-gray-900 text-center mb-2 tracking-tight">Admin Portal</Text>
                    <Text className="text-base text-gray-500 text-center mb-10 font-medium">Movie Booking System</Text>

                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100"
                            placeholder="admin@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-2 ml-1">Password</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-[#e50914] p-4 rounded-xl items-center shadow-md active:opacity-90"
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-lg font-bold">Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}