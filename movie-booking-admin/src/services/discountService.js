import api from "./api";

export const getDiscounts = () => api.get("/discounts");
export const getDiscount = (id) => api.get(`/discounts/${id}`);
export const createDiscount = (data) => api.post("/discounts", data);
export const updateDiscount = (id, data) => api.put(`/discounts/${id}`, data);
export const deleteDiscount = (id) => api.delete(`/discounts/${id}`);

export const getDiscountByCode = async (code) => {
    const response = await getDiscounts();
    return response.data.data.find(
        (discount) => discount.code?.toUpperCase() === code?.toUpperCase()
    );
};