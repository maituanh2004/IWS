// exports.generateSeats = () => {
//     const rows = 'ABCDEFGH';
//     const seats = [];

//     for (let i = 0; i < rows.length; i++) {
//         for (let j = 1; j <= 10; j++) {
//             seats.push(`${rows[i]}${j}`);
//         }
//     }

//     return seats;
// };

// // Validate seat format
// exports.validateSeats = (seats) => {
//   const allSeats = exports.generateSeats();
//   return seats.every((seat) => allSeats.includes(seat));
// };

const seatCache = {};

const getFixedSeats = (totalSeats) => {
  if (seatCache[totalSeats]) {
    return seatCache[totalSeats];
  }

  const rows = totalSeats === 80 ? 8 : 10;
  const cols = 10;

  const seats = [];

  for (let r = 0; r < rows; r++) {
    const row = String.fromCharCode(65 + r);

    for (let c = 1; c <= cols; c++) {
      let type = 'NORMAL';

      // 🎯 COUPLE (last row)
      if (r === rows - 1) {
        type = 'COUPLE';
      }

      // 🎯 VIP
      if (totalSeats === 100) {
        if (r >= 2 && r <= rows - 3 && c >= 3 && c <= cols - 2) {
          type = 'VIP';
        }
      } else {
        // room 80 special rule
        if (r >= 2 && r <= rows - 2 && c >= 3 && c <= cols - 2) {
          type = 'VIP';
        }
      }

      seats.push({
        code: `${row}${c}`,
        row,
        number: c,
        type
      });
    }
  }

  seatCache[totalSeats] = seats;

  return seats;
};

const validateSeats = (seats, totalSeats) => {
  if (!seats || !Array.isArray(seats)) return false;

  const validSeats = new Set(
    getFixedSeats(totalSeats).map(s => s.code)
  );

  return seats.every(seat => validSeats.has(seat));
};

module.exports = {
  getFixedSeats,
  validateSeats
};