import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function PaymentFailScreen({ navigation }) {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:20 }}>
      
      <Text style={{ fontSize:22, fontWeight:'bold', color:'red', marginBottom:20 }}>
        ❌ Thanh toán thất bại
      </Text>

      <Text style={{ textAlign:'center', marginBottom:30 }}>
        Giao dịch không thành công hoặc đã bị huỷ.
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#00D4FF',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 10
        }}
        onPress={() => navigation.replace('MovieList')}
      >
        <Text style={{ color:'#000', fontWeight:'bold' }}>
          Quay về trang chủ
        </Text>
      </TouchableOpacity>

    </View>
  );
}