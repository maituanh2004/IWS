const mockDiscounts = [
    { 
        id: '1', 
        code: 'SILVER15', 
        percentage: 15, 
        minPrice: 100000, 
        type: 'silver',
        expiryDate: new Date(Date.now() + 10 * 86400000).toISOString() 
    },
    { 
        id: '2', 
        code: 'GOLD50', 
        percentage: 50, 
        minPrice: 200000, 
        type: 'gold',
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString() 
    },
    { 
        id: '3', 
        code: 'STUDENT20', 
        percentage: 20, 
        minPrice: 0, 
        type: 'custom',
        expiryDate: new Date(Date.now() + 5 * 86400000).toISOString() 
    },
    { 
        id: '4', 
        code: 'EXPIRED10', 
        percentage: 10, 
        minPrice: 0, 
        type: 'custom',
        expiryDate: new Date(Date.now() - 5 * 86400000).toISOString() 
    },
];

export const getDiscounts = async () => {
    // Simulate API call
    return { data: { data: mockDiscounts } };
};

export const getDiscountByCode = (code) => {
    return mockDiscounts.find(d => d.code === code);
};
