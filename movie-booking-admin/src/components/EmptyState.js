import React from 'react';
import { View, Text } from 'react-native';

export default function EmptyState({ message = 'No data available' }) {
    return (
        <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-base">{message}</Text>
        </View>
    );
}