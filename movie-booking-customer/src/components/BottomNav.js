import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const NAV_ITEMS = [
  { id: 'MovieList',      icon: 'home',        label: 'TRANG CHỦ' },
  { id: 'BookingHistory', icon: 'ticket',      label: 'VÉ CỦA TÔI' },
  { id: 'Profile',        icon: 'person',      label: 'TÔI' },
];

export default function BottomNav({ activeNav }) {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row bg-[#0F0F18] border-t border-[#1E1E2E] pb-6 pt-2">
      {NAV_ITEMS.map((nav) => {
        const isActive = activeNav === nav.id || route.name === nav.id;
        return (
          <TouchableOpacity
            key={nav.id}
            className="flex-1 items-center gap-1"
            onPress={() => {
              if (route.name !== nav.id) {
                navigation.navigate(nav.id);
              }
            }}
          >
            <Ionicons
              name={isActive ? nav.icon : `${nav.icon}-outline`}
              size={22}
              color={isActive ? '#00D4FF' : '#555'}
            />
            <Text className={`text-[8px] font-bold tracking-widest ${isActive ? 'text-[#00D4FF]' : 'text-[#555]'}`}>
              {nav.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
