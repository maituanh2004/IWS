import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function AdminButton({ title, onPress, type = 'primary', loading = false, disabled = false, className = '' }) {
    const bgClass = type === 'danger' ? 'bg-[#f44336]' : type === 'success' ? 'bg-[#4caf50]' : 'bg-[#e50914]';
    return (
        <TouchableOpacity
            className={`${bgClass} p-4 rounded-lg items-center flex-row justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">{title}</Text>}
        </TouchableOpacity>
    );
}