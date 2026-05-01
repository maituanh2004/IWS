import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ScreenWrapper from '../components/ScreenWrapper';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const QUICK_ACTIONS = [
  {
    id: 'tickets',
    icon: 'ticket',
    iconLib: 'FontAwesome5',
    iconColor: '#00D4FF',
    iconBg: 'bg-[#00D4FF15]',
    label: 'Vé Của Tôi',
    sub: 'Sắp tới',
  },
  {
    id: 'wallet',
    icon: 'wallet-outline',
    iconLib: 'Ionicons',
    iconColor: '#A855F7',
    iconBg: 'bg-[#A855F715]',
    label: 'Ví CineViet',
    sub: '125,000đ',
  },
  {
    id: 'offers',
    icon: 'pricetag-outline',
    iconLib: 'Ionicons',
    iconColor: '#FF6B5A',
    iconBg: 'bg-[#FF6B5A15]',
    label: 'Ưu Đãi',
    sub: '5 mã có sẵn',
  },
  {
    id: 'points',
    icon: 'star',
    iconLib: 'FontAwesome5',
    iconColor: '#F4C430',
    iconBg: 'bg-[#F4C43015]',
    label: 'Điểm Thưởng',
    sub: '720 điểm',
  },
];

const ACCOUNT_ITEMS = [
  { id: 'personalInfo', icon: 'person-outline', label: 'Thông tin cá nhân', type: 'chevron' },
  { id: 'notifications', icon: 'notifications-outline', label: 'Thông báo', type: 'toggle' },
  { id: 'language', icon: 'globe-outline', label: 'Ngôn ngữ', type: 'value', value: 'Tiếng Việt' },
  { id: 'security', icon: 'lock-closed-outline', label: 'Bảo mật', type: 'chevron' },
];

const APP_ITEMS = [
  { id: 'theme', icon: 'moon-outline', label: 'Giao diện', type: 'value', value: 'Tối' },
  { id: 'rate', icon: 'star-outline', label: 'Đánh giá ứng dụng', type: 'chevron' },
  { id: 'support', icon: 'headset-outline', label: 'Hỗ trợ khách hàng', type: 'chevron' },
];

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleQuickAction = (id) => {
    if (id === 'tickets') {
      navigation.navigate('BookingHistory');
    } else {
      Alert.alert('Thông báo', 'Tính năng này sẽ ra mắt sớm!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            signOut();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const renderSettingRow = (item, isLast) => (
    <TouchableOpacity
      key={item.id}
      className={`flex-row items-center justify-between py-4 px-4 ${!isLast ? 'border-b border-[#1E1E2E]' : ''}`}
      onPress={() => item.type !== 'toggle' && Alert.alert('Thông báo', 'Tính năng sắp ra mắt!')}
      activeOpacity={item.type === 'toggle' ? 1 : 0.6}
    >
    <View className="flex-row items-center flex-1">
      <Ionicons name={item.icon} size={20} color="#AAA" className="mr-3.5 w-6" />
      <Text className="text-gray-200 text-sm font-medium">{item.label}</Text>
    </View>

    {item.type === 'chevron' && (
      <Ionicons name="chevron-forward" size={18} color="#555" />
    )}

    {item.type === 'value' && (
      <View className="flex-row items-center gap-1">
        <Text className="text-gray-600 text-xs">{item.value}</Text>
        <Ionicons name="chevron-forward" size={18} color="#555" />
      </View>
    )}

    {item.type === 'toggle' && (
      <Switch
        value={notifEnabled}
        onValueChange={setNotifEnabled}
        trackColor={{ false: '#333', true: '#00D4FF' }}
        thumbColor="#FFFFFF"
      />
    )}
    </TouchableOpacity>
  );
  return (
      <ScreenWrapper>
        <Header title="Tài Khoản" showBack={false} />

        <ScrollView showsVerticalScrollIndicator={false} className="px-4">
          {/* Profile Hero Card */}
          <View className="bg-[#1C0F3F] rounded-3xl items-center pt-7 pb-6 px-5 mb-5 mt-4 shadow-xl shadow-purple-900/40 border border-purple-800/30">
            <View className="relative mb-3.5">
              <View className="w-22 h-22 rounded-full border-3 border-[#00D4FF] items-center justify-center shadow-lg shadow-[#00D4FF]/40">
                <View className="w-[78px] h-[78px] rounded-full bg-[#6C3483] items-center justify-center">
                  <Text className="text-white text-3xl font-black italic">{getInitials(user?.name)}</Text>
                </View>
              </View>
              <View className="absolute bottom-0 right-0 bg-[#00D4FF] w-6 h-6 rounded-full items-center justify-center border-2 border-[#1C0F3F]">
                <Ionicons name="camera" size={10} color="#FFF" />
              </View>
            </View>

            <Text className="text-white text-2xl font-black italic mb-1">{user?.name}</Text>
            <Text className="text-[#F4C430] text-sm font-black tracking-widest uppercase mb-4">Thành viên Vàng ✦</Text>

            <View className="w-full mb-2">
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-gray-400 text-[10px] font-bold tracking-widest">720 / 1000 ĐIỂM</Text>
                <Text className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Hạng Kim Cương 💎</Text>
              </View>
              <View className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                <View className="h-full bg-[#00D4FF] rounded-full" style={{ width: '72%' }} />
              </View>
            </View>

            <View className="flex-row w-full mt-4 border-t border-white/5 pt-5">
              <View className="flex-1 items-center">
                <Text className="text-white text-xl font-black italic">24</Text>
                <Text className="text-gray-500 text-[9px] font-black tracking-widest uppercase">PHIM</Text>
              </View>
              <View className="w-[1px] h-8 bg-white/10" />
              <View className="flex-1 items-center">
                <Text className="text-white text-xl font-black italic">38</Text>
                <Text className="text-gray-500 text-[9px] font-black tracking-widest uppercase">VÉ</Text>
              </View>
              <View className="w-[1px] h-8 bg-white/10" />
              <View className="flex-1 items-center">
                <Text className="text-white text-xl font-black italic">4.8</Text>
                <Text className="text-gray-500 text-[9px] font-black tracking-widest uppercase">ĐÁNH GIÁ</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            {QUICK_ACTIONS.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-[47.5%] bg-[#141420] rounded-2xl p-4 border border-[#1E1E2E]"
                onPress={() => handleQuickAction(item.id)}
              >
                <View className={`w-11 h-11 rounded-full items-center justify-center mb-3 ${item.iconBg}`}>
                  {item.iconLib === 'FontAwesome5' ? (
                    <FontAwesome5 name={item.icon} size={20} color={item.iconColor} />
                  ) : (
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                  )}
                </View>
                <Text className="text-white text-sm font-bold mb-1">{item.label}</Text>
                <Text className="text-gray-600 text-[11px] font-medium">{item.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ACCOUNT Section */}
          <Text className="text-gray-600 text-[10px] font-black tracking-[2px] mb-2.5 ml-1">TÀI KHOẢN</Text>
          <View className="bg-[#141420] rounded-2xl mb-6 overflow-hidden border border-[#1E1E2E]">
            {ACCOUNT_ITEMS.map((item, i) =>
              renderSettingRow(item, i === ACCOUNT_ITEMS.length - 1)
            )}
          </View>

          {/* APP Section */}
          <Text className="text-gray-600 text-[10px] font-black tracking-[2px] mb-2.5 ml-1 uppercase">Cài đặt ứng dụng</Text>
          <View className="bg-[#141420] rounded-2xl mb-6 overflow-hidden border border-[#1E1E2E]">
            {APP_ITEMS.map((item, i) =>
              renderSettingRow(item, i === APP_ITEMS.length - 1)
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2.5 bg-[#1A0505] border border-[#FF4444]/30 rounded-2xl py-4 mb-32"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4444" />
            <Text className="text-[#FF4444] text-base font-black italic tracking-widest">ĐĂNG XUẤT</Text>
          </TouchableOpacity>
        </ScrollView>

        <BottomNav />
      </ScreenWrapper>
      );
}
