import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        if (currentRoute !== screenName) {
            navigation.navigate(screenName);
        }
    };

    return (
        <View
            className="flex-row justify-around items-center bg-[#e50914] py-2 px-2"
            style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.name;
                return (
                    <TouchableOpacity
                        key={item.name}
                        onPress={() => handlePress(item.name)}
                        className="items-center justify-center flex-1 py-2 mx-1 rounded-xl"
                        style={isActive ? {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.4)',
                        } : {}}
                    >
                        <Icon size={24} color="#fff" strokeWidth={isActive ? 2.5 : 1.8} />
                        <Text
                            className="text-xs mt-1"
                            style={{ color: '#fff', fontWeight: isActive ? '800' : '500', opacity: isActive ? 1 : 0.75 }}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity onPress={signOut} className="items-center justify-center flex-1 py-2">
                <LogOut size={24} color="#fff" strokeWidth={1.8} />
                <Text className="text-xs mt-1" style={{ color: '#fff', opacity: 0.75, fontWeight: '500' }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}
