import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// ─── Dữ liệu menu nhanh (2×2 grid) ───────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id: 'tickets',
    icon: 'ticket',
    iconLib: 'FontAwesome5',
    iconColor: '#00D4FF',
    iconBg: '#00D4FF22',
    label: 'Vé Của Tôi',
    sub: '3 vé sắp tới',
  },
  {
    id: 'wallet',
    icon: 'wallet-outline',
    iconLib: 'Ionicons',
    iconColor: '#A855F7',
    iconBg: '#A855F722',
    label: 'Ví CineViet',
    sub: 'Số dư: 125,000đ',
  },
  {
    id: 'offers',
    icon: 'pricetag',
    iconLib: 'Ionicons',
    iconColor: '#FF6B5A',
    iconBg: '#FF6B5A22',
    label: 'Ưu Đãi Của Tôi',
    sub: '5 mã đang có',
  },
  {
    id: 'points',
    icon: 'star',
    iconLib: 'FontAwesome5',
    iconColor: '#F4C430',
    iconBg: '#F4C43022',
    label: 'Điểm Thưởng',
    sub: '720 điểm',
  },
];

// ─── Cài đặt Tài Khoản ────────────────────────────────────────────────────────
const ACCOUNT_ITEMS = [
  {
    id: 'personalInfo',
    icon: 'person-outline',
    label: 'Thông tin cá nhân',
    type: 'chevron',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    label: 'Thông báo',
    type: 'toggle',
  },
  {
    id: 'language',
    icon: 'globe-outline',
    label: 'Ngôn ngữ',
    type: 'value',
    value: 'Tiếng Việt',
  },
  {
    id: 'security',
    icon: 'lock-closed-outline',
    label: 'Bảo mật & Mật khẩu',
    type: 'chevron',
  },
];

// ─── Cài đặt Ứng Dụng ────────────────────────────────────────────────────────
const APP_ITEMS = [
  {
    id: 'theme',
    icon: 'moon-outline',
    label: 'Giao diện',
    type: 'value',
    value: 'Tối',
  },
  {
    id: 'rate',
    icon: 'star-outline',
    label: 'Đánh giá ứng dụng',
    type: 'chevron',
  },
  {
    id: 'support',
    icon: 'headset-outline',
    label: 'Hỗ trợ khách hàng',
    type: 'chevron',
  },
  {
    id: 'terms',
    icon: 'shield-checkmark-outline',
    label: 'Điều khoản & Chính sách',
    type: 'chevron',
  },
];

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const BOTTOM_NAV = [
  { id: 'MovieListScreen', icon: 'home-outline', label: 'TRANG CHỦ' },
  { id: 'movies', icon: 'film-outline', label: 'PHIM' },
  { id: 'cinemas', icon: 'business-outline', label: 'RẠP' },
  { id: 'profile', icon: 'person-outline', label: 'CÁ NHÂN' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const QuickIcon = ({ item }) => {
  if (item.iconLib === 'FontAwesome5') {
    return <FontAwesome5 name={item.icon} size={22} color={item.iconColor} />;
  }
  return <Ionicons name={item.icon} size={24} color={item.iconColor} />;
};

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  const [notifEnabled, setNotifEnabled] = useState(true);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleQuickAction = (id) => {
    if (id === 'tickets') {
      navigation.navigate('BookingHistory');
    } else {
      Alert.alert('Thông báo', 'Tính năng này sẽ ra mắt sớm!');
    }
  };

  const handleSettingPress = (item) => {
    if (item.type !== 'toggle') {
      Alert.alert('Thông báo', 'Tính năng này sẽ ra mắt sớm!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
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
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  // ─── Render setting row ────────────────────────────────────────────────────
  const renderSettingRow = (item, isLast) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingRow, !isLast && styles.settingRowBorder]}
      onPress={() => handleSettingPress(item)}
      activeOpacity={item.type === 'toggle' ? 1 : 0.6}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon} size={20} color="#AAAAAA" style={styles.settingIcon} />
        <Text style={styles.settingLabel}>{item.label}</Text>
      </View>

      {item.type === 'chevron' && (
        <Ionicons name="chevron-forward" size={18} color="#555" />
      )}

      {item.type === 'value' && (
        <View style={styles.settingValueRow}>
          <Text style={styles.settingValue}>{item.value}</Text>
          <Ionicons name="chevron-forward" size={18} color="#555" />
        </View>
      )}

      {item.type === 'toggle' && (
        <Switch
          value={notifEnabled}
          onValueChange={setNotifEnabled}
          trackColor={{ false: '#333', true: '#00D4FF' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#333"
        />
      )}
    </TouchableOpacity>
  );

  // ─── UI ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* ── Top Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CINEVIET</Text>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={22} color="#00D4FF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Profile Hero Card ── */}
        <View style={styles.heroCard}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
              </View>
            </View>
            {/* Camera badge */}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={10} color="#FFFFFF" />
            </View>
          </View>

          {/* Name & Membership */}
          <Text style={styles.heroName}>{user?.name}</Text>
          <Text style={styles.heroMembership}>Thành viên Vàng ✦</Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLeft}>720 / 1000 điểm</Text>
            <View style={styles.progressRight}>
              <Text style={styles.progressRightText}>hạng Kim Cương </Text>
              <Text>💎</Text>
            </View>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '72%' }]} />
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>PHIM</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>38</Text>
              <Text style={styles.statLabel}>VÉ</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>ĐÁNH GIÁ</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Actions 2×2 Grid ── */}
        <View style={styles.gridContainer}>
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCard}
              onPress={() => handleQuickAction(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: item.iconBg }]}>
                <QuickIcon item={item} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <Text style={styles.gridSub}>{item.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── TÀI KHOẢN Section ── */}
        <Text style={styles.sectionHeader}>TÀI KHOẢN</Text>
        <View style={styles.settingsCard}>
          {ACCOUNT_ITEMS.map((item, i) =>
            renderSettingRow(item, i === ACCOUNT_ITEMS.length - 1)
          )}
        </View>

        {/* ── ỨNG DỤNG Section ── */}
        <Text style={styles.sectionHeader}>ỨNG DỤNG</Text>
        <View style={styles.settingsCard}>
          {APP_ITEMS.map((item, i) =>
            renderSettingRow(item, i === APP_ITEMS.length - 1)
          )}
        </View>

        {/* ── Logout Button ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>Đăng Xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Bottom Navigation ── */}
      <View style={styles.bottomNav}>
        {BOTTOM_NAV.map((nav) => {
          const active = nav.id === 'profile';
          return (
            <TouchableOpacity
              key={nav.id}
              style={styles.navItem}
              onPress={() => {
                if (nav.id !== 'profile') {
                  navigation.navigate(
                    nav.id === 'MovieListScreen' ? 'MovieListScreen'
                    : nav.id === 'movies' ? 'Movies'
                    : 'Cinemas'
                  );
                }
              }}
            >
              <Ionicons
                name={nav.icon}
                size={22}
                color={active ? '#00D4FF' : '#555'}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {nav.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#0A0A0F',
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#00D4FF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // ── Scroll ──────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // ── Hero Card ───────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: '#1C0F3F',
    borderRadius: 20,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    // Gradient-like layered shadow
    shadowColor: '#6C3483',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },

  // Avatar
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#00D4FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#6C3483',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00D4FF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C0F3F',
  },

  // Name & Membership
  heroName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  heroMembership: {
    color: '#F4C430',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 18,
  },

  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  progressLeft: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRightText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#2D2D4A',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 3,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#777',
    fontSize: 10,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#2D2D4A',
  },

  // ── Quick Actions Grid ───────────────────────────────────────────────────────
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridCard: {
    width: '47.5%',
    backgroundColor: '#141420',
    borderRadius: 16,
    padding: 16,
  },
  gridIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridSub: {
    color: '#777',
    fontSize: 12,
  },

  // ── Settings ─────────────────────────────────────────────────────────────────
  sectionHeader: {
    color: '#555',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: '#141420',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E1E2E',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 14,
    width: 22,
  },
  settingLabel: {
    color: '#DDDDDD',
    fontSize: 14,
    fontWeight: '500',
  },
  settingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    color: '#777',
    fontSize: 13,
  },

  // ── Logout ──────────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1A0505',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Bottom Nav ───────────────────────────────────────────────────────────────
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0F0F18',
    borderTopWidth: 0.5,
    borderTopColor: '#1E1E2E',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    color: '#555',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: '#00D4FF',
  },
});