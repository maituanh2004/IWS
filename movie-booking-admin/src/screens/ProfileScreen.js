import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { User, Lock, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';

export default function ProfileScreen() {
    const { user, signOut, refreshUser } = useAuth();
    
    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileLoading, setProfileLoading] = useState(false);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name || !email) {
            Alert.alert("Error", "Please fill in name and email");
            return;
        }
        setProfileLoading(true);
        try {
            await api.updateDetails({ name, email });
            await refreshUser();
            Alert.alert("Success", "Profile updated successfully.");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.error || "Failed to update profile");
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            await api.updatePassword({ currentPassword, newPassword });
            Alert.alert("Success", "Password updated successfully");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert("Error", error.response?.data?.error || "Failed to update password");
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Admin Profile" showBack={true} />
            <Navbar />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                    
                    {/* Header Card */}
                    <View className="bg-[#e50914] rounded-3xl p-6 mb-8 shadow-xl flex-row items-center border border-white/20">
                        <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center border border-white/30">
                            <User color="#fff" size={32} />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-white text-2xl font-black tracking-tight">{user?.name}</Text>
                            <View className="flex-row items-center mt-1">
                                <View className="bg-white/20 px-2 py-0.5 rounded-md border border-white/30">
                                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{user?.role}</Text>
                                </View>
                                <Text className="text-white/70 text-xs ml-3 font-medium">{user?.email}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section: Personal Information */}
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4 ml-1">
                            <User color="#e50914" size={20} strokeWidth={2.5} />
                            <Text className="text-lg font-black text-gray-900 ml-2.5 uppercase tracking-tight">Personal Information</Text>
                        </View>
                        
                        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <View className="mb-4">
                                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Full Name</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100 font-medium"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                />
                            </View>
                            <View className="mb-6">
                                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Email Address</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100 font-medium"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            
                            <TouchableOpacity
                                className="bg-[#e50914] p-4.5 rounded-2xl items-center shadow-lg active:opacity-90 flex-row justify-center"
                                onPress={handleUpdateProfile}
                                disabled={profileLoading}
                                style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 }}
                            >
                                {profileLoading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <CheckCircle2 color="#fff" size={20} />
                                        <Text className="text-white text-lg font-black ml-2 uppercase tracking-tighter">Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Section: Security */}
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4 ml-1">
                            <Lock color="#e50914" size={20} strokeWidth={2.5} />
                            <Text className="text-lg font-black text-gray-900 ml-2.5 uppercase tracking-tight">Security & Password</Text>
                        </View>
                        
                        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <View className="mb-4">
                                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Current Password</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100 font-medium"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="••••••••"
                                    secureTextEntry
                                />
                            </View>
                            <View className="mb-4">
                                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase ml-1">New Password</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100 font-medium"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Min 6 characters"
                                    secureTextEntry
                                />
                            </View>
                            <View className="mb-6">
                                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase ml-1">Confirm New Password</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-xl text-base text-gray-900 border border-gray-100 font-medium"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Re-type new password"
                                    secureTextEntry
                                />
                            </View>
                            
                            <TouchableOpacity
                                className="bg-[#333] p-4.5 rounded-2xl items-center shadow-md active:opacity-90 flex-row justify-center"
                                onPress={handleChangePassword}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Lock color="#fff" size={20} />
                                        <Text className="text-white text-lg font-black ml-2 uppercase tracking-tighter">Update Password</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Section: Account Actions */}
                    <TouchableOpacity
                        className="bg-white border-2 border-red-100 p-5 rounded-3xl flex-row items-center justify-between shadow-sm active:bg-red-50"
                        onPress={signOut}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-red-100 p-3 rounded-2xl mr-4 uppercase">
                                <LogOut color="#e50914" size={24} />
                            </View>
                            <View>
                                <Text className="text-lg font-black text-gray-900">Sign Out</Text>
                                <Text className="text-gray-400 text-xs font-medium">End your current session</Text>
                            </View>
                        </View>
                        <ChevronRight color="#d1d5db" size={24} />
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
