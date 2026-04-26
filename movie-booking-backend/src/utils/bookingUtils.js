exports.groupBookings = (bookings) => {
  const grouped = {};

  bookings.forEach(b => {
    const key = b.bookingGroupId.toString();

    if (!grouped[key]) {
      grouped[key] = {
        bookingGroupId: key,
        showtime: b.showtime,
        seats: [],
        totalPrice: 0,
        originalPrice: 0,
        discountCode: b.discountCode,
        status: b.status,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt
      };
    }

    grouped[key].seats.push(b.seat);
    grouped[key].totalPrice += b.totalPrice;
    grouped[key].originalPrice += b.originalPrice || 0;
  });

  return Object.values(grouped);
};