import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function AdminHeader({ title, rightButtons = [], showBack = false }) {
    const navigation = useNavigation();

    return (
        <View className="bg-[#e50914] p-4 pt-12 flex-row items-center justify-center relative min-h-[100px] shadow-md">
            {showBack && (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute left-4 bottom-5 p-1 flex-row items-center"
                >
                    <ChevronLeft color="#000" size={28} />
                </TouchableOpacity>
            )}

            <Text className="text-xl font-extrabold text-black uppercase tracking-wider text-center">{title}</Text>

            {rightButtons.length > 0 && (
                <View className="flex-row gap-2 absolute right-4 bottom-4">
                    {rightButtons.map((btn, idx) => (
                        <TouchableOpacity key={idx} onPress={btn.onPress} className="bg-black/20 px-3 py-1.5 rounded-lg">
                            <Text className="text-black text-xs font-bold">{btn.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
