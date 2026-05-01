import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import * as api from '../services/api';

export default function BookingDetailScreen({ route }) {
  const { bookingGroupId } = route.params;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await api.getBookingByGroupId(bookingGroupId);
      setBooking(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <Text>Không tìm thấy vé</Text>
      </View>
    );
  }

  const movie = booking.showtime?.movie;

  return (
    <ScrollView style={{ flex:1, backgroundColor:'#0A0A0F', padding:20 }}>

      {/* HEADER */}
      <Text style={{
        fontSize:24,
        fontWeight:'bold',
        color:'#00D4FF',
        textAlign:'center',
        marginBottom:20
      }}>
        🎉 Vé của bạn
      </Text>

      {/* CARD */}
      <View style={{
        backgroundColor:'#141420',
        borderRadius:20,
        padding:20,
        borderWidth:1,
        borderColor:'#1E1E2E'
      }}>

        {/* MOVIE */}
        <Text style={{ color:'#FFF', fontSize:18, fontWeight:'bold', marginBottom:10 }}>
          {movie?.title}
        </Text>

        <Text style={{ color:'#888', marginBottom:5 }}>
          Suất chiếu: {new Date(booking.showtime?.startTime).toLocaleString()}
        </Text>

        <Text style={{ color:'#888', marginBottom:5 }}>
          Phòng: {booking.showtime?.room}
        </Text>

        <Text style={{ color:'#888', marginBottom:10 }}>
          Ghế: {booking.seatNumber}
        </Text>

        <View style={{ height:1, backgroundColor:'#1E1E2E', marginVertical:10 }} />

        {/* PRICE */}
        <Text style={{ color:'#FFF', fontSize:16 }}>
          Giá: <Text style={{ color:'#00D4FF', fontWeight:'bold' }}>
            {booking.totalPrice.toLocaleString()} VND
          </Text>
        </Text>

        <Text style={{ color:'#4CAF50', marginTop:5 }}>
          Trạng thái: Thành công
        </Text>

      </View>

      {/* BOOKING ID */}
      <Text style={{
        color:'#666',
        textAlign:'center',
        marginTop:15,
        fontSize:12
      }}>
        Mã vé: {bookingGroupId}
      </Text>

    </ScrollView>
  );
}