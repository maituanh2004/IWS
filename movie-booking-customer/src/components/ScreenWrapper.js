import React from 'react';
import { View, SafeAreaView, StatusBar, Platform } from 'react-native';

export default function ScreenWrapper({ children, bg = 'bg-[#0A0A0F]', barStyle = 'light-content' }) {
  return (
    <View className={`flex-1 ${bg}`}>
      <StatusBar barStyle={barStyle} backgroundColor="transparent" translucent />
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
