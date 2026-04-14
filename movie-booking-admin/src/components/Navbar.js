import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Film, Calendar, Tag, LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const navigation = useNavigation();
    const route = useRoute();
    const { signOut } = useAuth();

    const currentRoute = route.name;

    const navItems = [
        { name: 'MovieManagement', label: 'Movies', icon: Film },
        { name: 'ShowtimeManagement', label: 'Showtimes', icon: Calendar },
        { name: 'DiscountManagement', label: 'Discounts', icon: Tag },
    ];

    const handlePress = (screenName) => {
        // Prevent navigating to the same screen to avoid stack duplicates
        if (currentRoute !== screenName) {
            navigation.navigate(screenName);
        }
    };

    return (
        <View className="flex-row justify-around items-center bg-[#e50914] py-3 px-2 shadow-xl">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.name;
                return (
                    <TouchableOpacity
                        key={item.name}
                        onPress={() => handlePress(item.name)}
                        className={`items-center justify-center flex-1 py-2 mx-1 rounded-xl ${isActive ? 'bg-black/10 border border-black shadow-sm' : 'border border-transparent'}`}
                    >
                        <Icon size={24} color="#000" strokeWidth={isActive ? 3 : 2} />
                        <Text className={`text-xs mt-1 ${isActive ? "text-black font-extrabold" : "text-black/70 font-medium"}`}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity onPress={signOut} className="items-center justify-center flex-1 py-1">
                <LogOut size={28} color="#000000ff" />
                <Text className="text-sm mt-1.5 text-black-500">Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
