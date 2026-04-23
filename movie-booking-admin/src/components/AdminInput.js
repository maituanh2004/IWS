import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function AdminInput({ label, error, className = '', ...props }) {
    return (
        <View className={`mb-4 ${className}`}>
            {label && <Text className="text-base font-bold text-gray-900 mb-2">{label}</Text>}
            <TextInput
                className="bg-gray-50 text-gray-900 p-4 rounded-lg text-base border border-gray-100"
                placeholderTextColor="#9ca3af"
                {...props}
            />
            {error && <Text className="text-[#f44336] text-sm mt-1">{error}</Text>}
        </View>
    );
}
