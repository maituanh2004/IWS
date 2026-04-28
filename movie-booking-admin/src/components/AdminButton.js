import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export default function AdminButton({ title, onPress, type = 'primary', loading = false, disabled = false, className = '' }) {
    const bgClass = type === 'danger' ? 'bg-red-600' : type === 'success' ? 'bg-emerald-600' : 'bg-[#c04444]';
    return (
        <TouchableOpacity
            className={`${bgClass} p-5 rounded-2xl items-center flex-row justify-center shadow-xl active:opacity-90 ${disabled ? 'opacity-50' : ''} ${className}`}
            style={type === 'primary' ? { shadowColor: '#c04444', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 } : {}}
            onPress={onPress}
            disabled={disabled || loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">{title}</Text>}
        </TouchableOpacity>
    );
}