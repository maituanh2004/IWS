import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUI } from '../context/UIContext';

export default function ScreenWrapper({ children, bg, barStyle }) {
  const { colors } = useUI();
  
  return (
    <View className={`flex-1 ${bg || colors.background}`}>
      <StatusBar barStyle={barStyle || colors.statusBarStyle} backgroundColor="transparent" translucent />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="flex-1">
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
