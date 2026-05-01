export const formatCurrency = (value = 0) => {
  return `${Number(value).toLocaleString('vi-VN')}đ`;
};

export const formatDate = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (date) => {
  if (!date) return '';

  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isSeatBooked = (seatId, seatMap) => {
  if (seatId.includes('-')) {
    const row = seatId[0];
    const [a, b] = seatId.slice(1).split('-');

    return (
      seatMap[`${row}${a}`]?.isBooked ||
      seatMap[`${row}${b}`]?.isBooked
    );
  }
  return seatMap[seatId]?.isBooked;
};

export const getDisplaySeatType = (seatId, seatMap) => {
  if (seatId.includes('-')) return 'COUPLE';
  return seatMap[seatId]?.type || 'NORMAL';
};