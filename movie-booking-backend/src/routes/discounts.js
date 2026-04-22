const express = require('express');
const {
    getDiscounts,
    getDiscount,
    createDiscount,
    updateDiscount,
    deleteDiscount
} = require('../controllers/discounts');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
    .get(getDiscounts)
    .post(protect, authorize('admin'), createDiscount);

router.route('/:id')
    .get(getDiscount)
    .put(protect, authorize('admin'), updateDiscount)
    .delete(protect, authorize('admin'), deleteDiscount);

module.exports = router;