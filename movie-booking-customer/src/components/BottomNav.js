import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Home, Ticket, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUI } from '../context/UIContext';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const NAV_ITEMS = [
  { id: 'MovieList',      icon: Home,        label: 'Movies' },
  { id: 'DiscountHistory', icon: Ticket,      label: 'Booking' },
  { id: 'Profile',        icon: User,        label: 'Account' },
];

const NavIcon = ({ icon: Icon, isActive }) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isActive) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 1500 }),
                    withTiming(1, { duration: 1500 })
                ),
                -1,
                true
            );
        } else {
            scale.value = withSpring(1);
        }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <Animated.View
            style={animatedStyle}
            className={`items-center justify-center w-11 h-11 rounded-2xl ${isActive ? 'bg-[#00D4FF] shadow-xl shadow-[#00D4FF]/50' : 'bg-transparent'}`}
        >
            <Icon
                size={isActive ? 20 : 18}
                color={isActive ? "#fff" : "#6b7280"}
                strokeWidth={isActive ? 3 : 2}
            />
        </Animated.View>
    );
};


export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useUI();

  return (
    <View className="absolute left-0 right-0 items-center px-6" style={{ bottom: Math.max(insets.bottom + 10, 16) }}>
        <View
            style={styles.blurContainer}
            className={`flex-row justify-around items-center rounded-[40px] border border-white/10 ${theme === 'dark' ? 'bg-[#121212]' : 'bg-white shadow-lg'} overflow-hidden`}
        >
            {NAV_ITEMS.map((item) => {
                const isActive = route.name === item.id;
                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          if (!isActive) {
                            navigation.navigate(item.id);
                          }
                        }}
                        className="items-center justify-center py-2 flex-1"
                        activeOpacity={0.7}
                    >
                        <NavIcon icon={item.icon} isActive={isActive} />
                        <Text
                            className={`text-[7px] font-black uppercase tracking-[2px] mt-1.5 ${isActive ? (theme === 'dark' ? 'text-white' : 'text-[#0A0A0F]') : 'text-gray-500'}`}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    blurContainer: {
        width: width - 40,
        height: 64,
        paddingHorizontal: 10,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
    }
});
