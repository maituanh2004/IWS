import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminHeader({ title, rightButtons = [], showBack = false, showClose = false }) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <BlurView intensity={30} tint="dark" style={{ paddingTop: insets.top }}>
            <View className="p-6 flex-row items-center justify-between border-b border-white/5">
                <View className="flex-row items-center">
                    {showBack ? (
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="p-2.5 bg-white/5 rounded-2xl mr-4 border border-white/10"
                        >
                            <ChevronLeft color="#fff" size={24} />
                        </TouchableOpacity>
                    ) : !showClose ? (
                        <View className="w-1.5 h-10 bg-[#c04444] rounded-full mr-4 shadow-xl shadow-[#c04444]/50" />
                    ) : null}
                    <Text className="text-3xl font-black text-white italic tracking-tighter uppercase">{title}</Text>
                </View>

                <View className="flex-row gap-2 items-center">
                    {rightButtons.map((btn, idx) => (
                        <TouchableOpacity 
                            key={idx} 
                            onPress={btn.onPress} 
                            className="bg-[#c04444] px-5 py-2.5 rounded-2xl shadow-xl shadow-[#c04444]/40 active:opacity-90"
                        >
                            <Text className="text-white text-[10px] font-black uppercase tracking-[2px]">{btn.title}</Text>
                        </TouchableOpacity>
                    ))}
                    {showClose && (
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-3 bg-white/5 rounded-2xl border border-white/10 ml-2">
                            <X color="#fff" size={20} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </BlurView>
    );
}
