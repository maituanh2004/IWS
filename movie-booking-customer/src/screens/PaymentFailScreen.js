import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentFailScreen({ navigation }) {
  return (
    <View style={{
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      padding:20,
      backgroundColor:'#0A0A0F'
    }}>

      <Ionicons name="close-circle" size={80} color="#FF4444" />

      <Text style={{
        fontSize:24,
        fontWeight:'bold',
        color:'#FF4444',
        marginTop:20
      }}>
        Thanh toán thất bại
      </Text>

      <Text style={{
        textAlign:'center',
        marginTop:10,
        color:'#888'
      }}>
        Giao dịch không thành công hoặc đã bị huỷ.
      </Text>

      {/* 🔁 Retry */}
      <TouchableOpacity
        style={{
          backgroundColor:'#00D4FF',
          padding:14,
          borderRadius:12,
          marginTop:30,
          width:'100%',
          alignItems:'center'
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ fontWeight:'bold' }}>
          Thử lại
        </Text>
      </TouchableOpacity>

      {/* 🏠 Home */}
      <TouchableOpacity
        style={{
          marginTop:15,
          borderWidth:1,
          borderColor:'#333',
          padding:14,
          borderRadius:12,
          width:'100%',
          alignItems:'center'
        }}
        onPress={() => navigation.replace('MovieList')}
      >
        <Text style={{ color:'#aaa' }}>
          Về trang chủ
        </Text>
      </TouchableOpacity>

    </View>
  );
}