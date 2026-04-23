import api from './api';

export const getDiscounts = async () => {
    return api.get('discounts');
};

export const getDiscountByCode = async (code) => {
    return api.get(`discounts/code/${code}`);
};

export const createDiscount = async (discountData) => {
    return api.post('discounts', discountData);
};

export const updateDiscount = async (id, discountData) => {
    return api.put(`discounts/${id}`, discountData);
};

export const deleteDiscount = async (id) => {
    return api.delete(`discounts/${id}`);
};
