import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clapperboard, Calendar, Tag, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const NavIcon = ({ icon: Icon, isActive }) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withSpring(isActive ? 1.05 : 1);
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <Animated.View
            style={animatedStyle}
            className={`items-center justify-center w-11 h-11 rounded-2xl ${isActive ? 'bg-[#c04444] shadow-xl shadow-[#c04444]/50' : 'bg-transparent'}`}
        >
            <Icon
                size={isActive ? 20 : 18}
                color={isActive ? "#fff" : "#6b7280"}
                strokeWidth={isActive ? 3 : 2}
            />
        </Animated.View>
    );
};

export default function Navbar() {
    const navigation = useNavigation();
    const route = useRoute();

    const currentRoute = route.name;

    const navItems = [
        { name: 'MovieManagement', label: 'Movies', icon: Clapperboard },
        { name: 'ShowtimeManagement', label: 'Shows', icon: Calendar },
        { name: 'DiscountManagement', label: 'Vouchers', icon: Tag },
        { name: 'Profile', label: 'Account', icon: User },
    ];

    const handlePress = (screenName) => {
        if (currentRoute !== screenName) {
            navigation.navigate(screenName);
        }
    };

    return (
        <View className="absolute bottom-8 left-0 right-0 items-center px-6">
            <View
                style={styles.blurContainer}
                className="flex-row justify-around items-center rounded-[40px] border border-white/10 bg-[#121212] overflow-hidden"
            >
                {navItems.map((item) => {
                    const isActive = currentRoute === item.name;
                    return (
                        <TouchableOpacity
                            key={item.name}
                            onPress={() => handlePress(item.name)}
                            className="items-center justify-center py-3 flex-1"
                            activeOpacity={0.7}
                        >
                            <NavIcon icon={item.icon} isActive={isActive} />
                            <Text
                                className={`text-[7px] font-black uppercase tracking-[2px] mt-1.5 ${isActive ? 'text-white' : 'text-gray-500'}`}
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
        height: 80,
        paddingHorizontal: 10,
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
    }
});
