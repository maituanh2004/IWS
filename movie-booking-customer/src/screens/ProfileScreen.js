import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import * as api from '../services/api';

const QUICK_ACTIONS = [
  { id: 'tickets', icon: 'ticket-alt', iconLib: 'FontAwesome5', iconColor: '#00D4FF', iconBg: 'bg-[#00D4FF15]', labelKey: 'my_tickets', subKey: 'upcoming' },
  { id: 'edit_profile', icon: 'person-outline', iconLib: 'Ionicons', iconColor: '#A855F7', iconBg: 'bg-[#A855F715]', labelKey: 'personal_info', subKey: 'account' },
];

export default function ProfileScreen({ navigation }) {
  const { user, signOut, setUser } = useAuth();
  const { theme, language, toggleTheme, toggleLanguage, t, colors } = useUI();
  // Edit Profile State
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const ACCOUNT_ITEMS = [
    { id: 'personalInfo', icon: 'person-outline', label: t('personal_info'), type: 'chevron' },
    { id: 'language', icon: 'globe-outline', label: t('language'), type: 'value', value: language === 'en' ? 'English' : 'Tiếng Việt' },
  ];

  const APP_ITEMS = [
    { id: 'theme', icon: theme === 'dark' ? 'moon-outline' : 'sunny-outline', label: t('theme'), type: 'value', value: theme === 'dark' ? 'Dark' : 'Light' },
  ];

  const handleQuickAction = (id) => {
    if (id === 'tickets') {
      navigation.navigate('DiscountHistory');
    } else if (id === 'edit_profile') {
      setEditName(user?.name || '');
      setEditEmail(user?.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setModalVisible(true);
    } else {
      Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  const handleSaveProfile = async () => {
    if (!editName || !editEmail) {
      Alert.alert('Error', 'Name and Email are required.');
      return;
    }
    setSaving(true);
    try {
      if (editName !== user?.name || editEmail !== user?.email) {
        await api.updateDetails(editName, editEmail);
      }
      if (currentPassword && newPassword) {
        await api.updatePassword(currentPassword, newPassword);
      }

      // Refresh user data
      const response = await api.getMe();
      if (setUser) setUser(response.data.data);

      Alert.alert('Success', 'Profile updated successfully.');
      setModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const renderSettingRow = (item, isLast) => (
    <TouchableOpacity
      key={item.id}
      className={`flex-row items-center justify-between py-4 px-4 ${!isLast ? `border-b ${colors.border}` : ''}`}
      onPress={() => {
        if (item.id === 'theme') toggleTheme();
        else if (item.id === 'language') toggleLanguage();
        else if (item.id === 'personalInfo') {
          setEditName(user?.name || '');
          setEditEmail(user?.email || '');
          setCurrentPassword('');
          setNewPassword('');
          setModalVisible(true);
        }
        else if (item.type !== 'toggle') Alert.alert('Coming Soon', 'This feature is coming soon!');
      }}
      activeOpacity={item.type === 'toggle' ? 1 : 0.6}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name={item.icon} size={20} color="#AAA" className="mr-3.5 w-6" />
        <Text className={`${colors.text} text-sm font-medium`}>{item.label}</Text>
      </View>
      {item.type === 'chevron' && <Ionicons name="chevron-forward" size={18} color="#555" />}
      {item.type === 'value' && (
        <View className="flex-row items-center gap-1">
          <Text className={`${colors.textMuted} text-xs`}>{item.value}</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </View>
      )}

    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <Header title={t('account')} showBack={false} />
      <ScrollView showsVerticalScrollIndicator={false} className="px-4" contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Profile Hero Card */}
        <View className="bg-[#1C0F3F] rounded-3xl items-center pt-7 pb-6 px-5 mb-5 mt-4 shadow-xl shadow-purple-900/40 border border-purple-800/30">
          <View className="relative mb-3.5">
            <View className="w-22 h-22 rounded-full border-3 border-[#00D4FF] items-center justify-center shadow-lg shadow-[#00D4FF]/40">
              <View className="w-[78px] h-[78px] rounded-full bg-[#6C3483] items-center justify-center">
                <Text className="text-white text-3xl font-black italic">{getInitials(user?.name)}</Text>
              </View>
            </View>

          </View>
          <Text className="text-white text-2xl font-black italic mb-1">{user?.name}</Text>
          <View className="flex-row w-full mt-4 border-t border-white/5 pt-5" />
        </View>

        {/* Quick Actions Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity key={item.id} className={`w-[47.5%] ${colors.card} rounded-2xl p-4 border ${colors.border}`} onPress={() => handleQuickAction(item.id)}>
              <View className={`w-11 h-11 rounded-full items-center justify-center mb-3 ${item.iconBg}`}>
                {item.iconLib === 'FontAwesome5'
                  ? <FontAwesome5 name={item.icon} size={20} color={item.iconColor} />
                  : <Ionicons name={item.icon} size={22} color={item.iconColor} />}
              </View>
              <Text className={`${colors.text} text-sm font-bold mb-1`}>{t(item.labelKey)}</Text>
              <Text className={`${colors.textMuted} text-[11px] font-medium`}>{t(item.subKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACCOUNT Section */}
        <Text className={`${colors.textMuted} text-[10px] font-black tracking-[2px] mb-2.5 ml-1`}>ACCOUNT</Text>
        <View className={`${colors.card} rounded-2xl mb-6 overflow-hidden border ${colors.border}`}>
          {ACCOUNT_ITEMS.map((item, i) => renderSettingRow(item, i === ACCOUNT_ITEMS.length - 1))}
        </View>

        {/* APP Section */}
        <Text className={`${colors.textMuted} text-[10px] font-black tracking-[2px] mb-2.5 ml-1 uppercase`}>App Settings</Text>
        <View className={`${colors.card} rounded-2xl mb-6 overflow-hidden border ${colors.border}`}>
          {APP_ITEMS.map((item, i) => renderSettingRow(item, i === APP_ITEMS.length - 1))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2.5 bg-[#1A0505] border border-[#FF4444]/30 rounded-2xl py-4 mb-15"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text className="text-white text-base font-black italic tracking-widest">
            {t('sign_out')}
          </Text>
        </TouchableOpacity>

        <View className="h-24" />
      </ScrollView>
      <BottomNav />

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className={`rounded-t-[32px] p-6 pt-8 ${theme === 'dark' ? 'bg-[#141420]' : 'bg-white'}`}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`${colors.text} text-2xl font-black italic tracking-tighter`}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 items-center justify-center">
                <Ionicons name="close" size={20} color={theme === 'dark' ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <Text className={`${colors.textMuted} text-xs font-black tracking-widest uppercase mb-2 ml-1`}>Full Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor="#666"
              className={`w-full h-14 px-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-[#0A0A0F] text-white' : 'bg-gray-100 text-black'}`}
            />

            <Text className={`${colors.textMuted} text-xs font-black tracking-widest uppercase mb-2 ml-1`}>Email</Text>
            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Your email"
              placeholderTextColor="#666"
              autoCapitalize="none"
              keyboardType="email-address"
              className={`w-full h-14 px-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-[#0A0A0F] text-white' : 'bg-gray-100 text-black'}`}
            />

            <View className="h-[1px] bg-gray-200 dark:bg-white/10 mb-6" />

            <Text className={`${colors.textMuted} text-xs font-black tracking-widest uppercase mb-2 ml-1`}>Change Password (Optional)</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor="#666"
              secureTextEntry
              className={`w-full h-14 px-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-[#0A0A0F] text-white' : 'bg-gray-100 text-black'}`}
            />
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="New Password"
              placeholderTextColor="#666"
              secureTextEntry
              className={`w-full h-14 px-4 rounded-xl mb-8 ${theme === 'dark' ? 'bg-[#0A0A0F] text-white' : 'bg-gray-100 text-black'}`}
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={saving}
              className={`w-full h-14 rounded-2xl items-center justify-center flex-row px-4 ${saving ? 'bg-gray-500' : 'bg-[#00D4FF]'}`}
            >
              {saving ? (
                <ActivityIndicator color="#0A0A0F" />
              ) : (
                <Text className="text-[#0A0A0F] text-lg font-black tracking-wider italic" numberOfLines={1} adjustsFontSizeToFit>{t('save_changes')}</Text>
              )}
            </TouchableOpacity>
            <View className="h-10" />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
