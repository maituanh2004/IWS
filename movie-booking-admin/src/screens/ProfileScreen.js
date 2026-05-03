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
import BackgroundWrapper from '../components/BackgroundWrapper';


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
        <BackgroundWrapper>
            <AdminHeader title="Profile" showBack={true} />


            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-5 pt-8" contentContainerStyle={{ paddingBottom: 180 }}>


                    {/* Header Card */}
                    <View className="bg-black/40 rounded-[40px] p-8 mb-10 shadow-2xl flex-row items-center border border-white/10">
                        <View className="w-20 h-20 bg-[#c04444]/10 rounded-3xl items-center justify-center border border-[#c04444]/20 shadow-lg">
                            <User color="#c04444" size={40} />
                        </View>
                        <View className="ml-6 flex-1">
                            <Text className="text-white text-3xl font-black tracking-tighter italic">{user?.name}</Text>
                            <View className="flex-row items-center mt-2">
                                <View className="bg-[#c04444] px-3 py-1 rounded-xl shadow-lg shadow-[#c04444]/30">
                                    <Text className="text-white text-[8px] font-black uppercase tracking-widest italic">{user?.role}</Text>
                                </View>
                                <Text className="text-gray-400 text-[10px] ml-3 italic font-black tracking-widest">{user?.email}</Text>
                            </View>
                        </View>
                    </View>


                    {/* Section: Personal Information */}
                    <View className="mb-10">
                        <View className="flex-row items-center mb-6 ml-2">
                            <User color="#c04444" size={20} />
                            <Text className="text-xs font-black text-gray-500 ml-3 uppercase tracking-[4px] italic">Identity</Text>
                        </View>


                        <View className="bg-black/40 p-8 rounded-[40px] shadow-2xl border border-white/10">
                            <View className="mb-6">
                                <Text className="text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest ml-1">Full Name</Text>
                                <TextInput
                                    className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 font-black italic focus:border-[#c04444]"
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#4b5563"
                                />
                            </View>
                            <View className="mb-8">
                                <Text className="text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest ml-1">Email Address</Text>
                                <TextInput
                                    className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 font-black italic focus:border-[#c04444]"
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#4b5563"
                                />
                            </View>


                            <TouchableOpacity
                                className="bg-[#c04444] p-6 rounded-[24px] items-center shadow-2xl shadow-[#c04444]/30 flex-row justify-center"
                                onPress={handleUpdateProfile}
                                disabled={profileLoading}
                            >
                                {profileLoading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <CheckCircle2 color="#fff" size={20} />
                                        <Text className="text-white text-lg font-black ml-3 uppercase tracking-[2px]">Update Identity</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>


                    {/* Section: Security */}
                    <View className="mb-10">
                        <View className="flex-row items-center mb-6 ml-2">
                            <Lock color="#c04444" size={20} />
                            <Text className="text-xs font-black text-gray-500 ml-3 uppercase tracking-[4px] italic">Security</Text>
                        </View>


                        <View className="bg-black/40 p-8 rounded-[40px] shadow-2xl border border-white/10">
                            <View className="mb-4">
                                <Text className="text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest ml-1">Current Password</Text>
                                <TextInput
                                    className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 font-black italic focus:border-[#c04444]"
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="••••••••"
                                    secureTextEntry
                                    placeholderTextColor="#4b5563"
                                />
                            </View>
                            <View className="mb-4">
                                <Text className="text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest ml-1">New Password</Text>
                                <TextInput
                                    className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 font-black italic focus:border-[#c04444]"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Min 6 characters"
                                    secureTextEntry
                                    placeholderTextColor="#4b5563"
                                />
                            </View>
                            <View className="mb-8">
                                <Text className="text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest ml-1">Confirm New Password</Text>
                                <TextInput
                                    className="bg-white/5 p-5 rounded-2xl text-base text-white border border-white/10 font-black italic focus:border-[#c04444]"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Re-type new password"
                                    secureTextEntry
                                    placeholderTextColor="#4b5563"
                                />
                            </View>


                            <TouchableOpacity
                                className="bg-white/5 border border-white/10 p-6 rounded-[24px] items-center flex-row justify-center active:bg-white/10"
                                onPress={handleChangePassword}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Lock color="#c04444" size={20} />
                                        <Text className="text-white text-lg font-black ml-3 uppercase tracking-[2px]">Update Password</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>


                    {/* Section: Account Actions */}
                    <TouchableOpacity
                        className="bg-[#c04444]/10 border border-[#c04444]/20 p-8 rounded-[40px] flex-row items-center justify-between shadow-2xl active:bg-[#c04444]/20"
                        onPress={signOut}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-[#c04444] p-4 rounded-2xl mr-6 shadow-lg shadow-[#c04444]/40">
                                <LogOut color="#fff" size={24} />
                            </View>
                            <View>
                                <Text className="text-xl font-black text-white tracking-tighter">SIGN OUT</Text>
                                <Text className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">END SESSION</Text>
                            </View>
                        </View>
                        <ChevronRight color="#4b5563" size={24} />
                    </TouchableOpacity>


                </ScrollView>
            </KeyboardAvoidingView>
            <Navbar />
        </BackgroundWrapper>
    );
}