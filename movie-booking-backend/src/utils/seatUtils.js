exports.generateSeats = () => {
    const rows = 'ABCDEFGH';
    const seats = [];

    for (let i = 0; i < rows.length; i++) {
        for (let j = 1; j <= 10; j++) {
            seats.push(`${rows[i]}${j}`);
        }
    }

    return seats;
};