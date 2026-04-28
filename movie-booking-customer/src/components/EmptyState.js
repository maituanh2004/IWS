import React from 'react';
import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';

export default function EmptyState({ message = 'No data available' }) {
    return (
        <View className="flex-1 justify-center items-center py-20">
            <Inbox color="#666" size={48} strokeWidth={1} />
            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[4px] mt-4 italic">{message}</Text>
        </View>
    );
}
