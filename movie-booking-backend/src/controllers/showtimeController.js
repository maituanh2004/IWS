const showtimeService = require('../services/showtimeService');

// GET ALL
exports.getShowtimes = async (req, res) => {
  try {
    const data = await showtimeService.getAllShowtimes();

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET ONE
exports.getShowtime = async (req, res) => {
  try {
    const data = await showtimeService.getShowtimeById(req.params.id);

    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// CREATE
exports.createShowtime = async (req, res) => {
  try {
    const data = await showtimeService.createShowtime(req.body);

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updateShowtime = async (req, res) => {
  try {
    const data = await showtimeService.updateShowtime(
      req.params.id,
      req.body
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deleteShowtime = async (req, res) => {
  try {
    await showtimeService.deleteShowtime(req.params.id);

    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// GET SEATS
exports.getSeats = async (req, res) => {
  try {
    const data = await showtimeService.getSeatAvailability(
      req.params.showtimeId
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// GET BY MOVIE
exports.getShowtimesByMovie = async (req, res) => {
  try {
    const data = await showtimeService.getShowtimesByMovie(
      req.params.movieId
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};