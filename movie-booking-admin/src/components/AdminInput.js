import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function AdminInput({ label, error, className = '', ...props }) {
    return (
        <View className={`mb-6 ${className}`}>
            {label && <Text className="text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">{label}</Text>}
            <TextInput
                className="bg-white/5 text-white p-5 rounded-2xl text-base border border-white/10 font-black italic focus:border-[#c04444]"
                placeholderTextColor="#4b5563"
                {...props}
            />
            {error && <Text className="text-red-500 text-[10px] font-black uppercase mt-2 ml-1 tracking-widest">{error}</Text>}
        </View>
    );
}
