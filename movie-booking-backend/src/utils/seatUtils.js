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

// =============================
// GET FIXED SEATS
// =============================
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
      if (type !== 'COUPLE') {
        if (totalSeats === 100) {
          if (r >= 2 && r <= rows - 3 && c >= 3 && c <= cols - 2) {
            type = 'VIP';
          }
        } else {
          if (r >= 2 && r <= rows - 2 && c >= 3 && c <= cols - 2) {
            type = 'VIP';
          }
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



// =============================
// GET COUPLE PAIR
// =============================
const getCouplePair = (seatCode) => {
  const row = seatCode[0];
  const number = parseInt(seatCode.slice(1));

  if (number % 2 === 0) {
    return [`${row}${number - 1}`, seatCode];
  } else {
    return [seatCode, `${row}${number + 1}`];
  }
};



// =============================
// VALIDATE + EXPAND SEATS
// =============================
const validateAndExpandSeats = (seats, totalSeats) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    throw new Error('Seats are required');
  }

  const fixedSeats = getFixedSeats(totalSeats);
  const seatMap = new Map(fixedSeats.map(s => [s.code, s]));

  const result = new Set();

  for (const seat of seats) {
    const seatInfo = seatMap.get(seat);

    if (!seatInfo) {
      throw new Error(`Invalid seat ${seat}`);
    }

    // 🎯 COUPLE → expand
    if (seatInfo.type === 'COUPLE') {
      const pair = getCouplePair(seat);
      pair.forEach(s => result.add(s));
    } else {
      result.add(seat);
    }
  }

  return Array.from(result);
};



// =============================
// SIMPLE VALIDATE (optional)
// =============================
const validateSeats = (seats, totalSeats) => {
  try {
    validateAndExpandSeats(seats, totalSeats);
    return true;
  } catch {
    return false;
  }
};



module.exports = {
  getFixedSeats,
  getCouplePair,
  validateAndExpandSeats,
  validateSeats
};