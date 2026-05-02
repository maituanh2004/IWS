import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UIContext = createContext({
    theme: 'dark',
    language: 'vi',
    toggleTheme: () => { },
    toggleLanguage: () => { },
    t: (key) => key,
    colors: {
        background: 'bg-[#0A0A0F]',
        card: 'bg-[#141420]',
        border: 'border-[#1E1E2E]',
        text: 'text-white',
        textSecondary: 'text-gray-500',
        textMuted: 'text-gray-600',
        primary: '#00D4FF',
        accent: '#F4C430',
        statusBarStyle: 'light-content',
        headerBg: 'bg-[#0A0A0F]',
    }
});

export const UIProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
    const [language, setLanguage] = useState('vi'); // 'en' or 'vi'

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            const savedLang = await AsyncStorage.getItem('language');
            if (savedTheme) setTheme(savedTheme);
            if (savedLang) setLanguage(savedLang);
        } catch (error) {
            console.error('Failed to load UI settings:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
    };

    const toggleLanguage = async () => {
        const newLang = language === 'en' ? 'vi' : 'en';
        setLanguage(newLang);
        await AsyncStorage.setItem('language', newLang);
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const colors = theme === 'dark' ? {
        background: 'bg-[#0A0A0F]',
        card: 'bg-[#141420]',
        border: 'border-[#1E1E2E]',
        text: 'text-white',
        textSecondary: 'text-gray-500',
        textMuted: 'text-gray-600',
        primary: '#00D4FF',
        accent: '#F4C430',
        statusBarStyle: 'light-content',
        headerBg: 'bg-[#0A0A0F]',
    } : {
        background: 'bg-[#F8F9FA]',
        card: 'bg-white',
        border: 'border-gray-200',
        text: 'text-[#0A0A0F]',
        textSecondary: 'text-gray-600',
        textMuted: 'text-gray-400',
        primary: '#00D4FF',
        accent: '#E6B800',
        statusBarStyle: 'dark-content',
        headerBg: 'bg-white',
    };

    return (
        <UIContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t, colors }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);

const translations = {
    en: {
        welcome: 'Welcome back',
        signin_continue: 'Sign in to continue',
        email: 'EMAIL',
        password: 'PASSWORD',
        remember_me: 'Remember me',
        forgot_password: 'Forgot password?',
        signin: 'SIGN IN',
        no_account: "Don't have an account?",
        signup: 'Sign up',
        account: 'ACCOUNT',
        personal_info: 'Personal Info',
        notifications: 'Notifications',
        language: 'Language',
        security: 'Security',
        theme: 'Theme',
        rate_app: 'Rate the App',
        support: 'Customer Support',
        sign_out: 'SIGN OUT',
        now_showing: 'Now Showing',
        see_all: 'See all',
        exclusive_offers: 'Vouchers',
        hanoi: 'Ha Noi',
        search_placeholder: 'Search movies, genres...',
        movies: 'MOVIES',
        tickets: 'VOUCHERS',
        rating: 'RATING',
        gold_member: 'Gold Member',
        my_tickets: 'My Vouchers',
        wallet: 'CineViet Wallet',
        offers: 'Vouchers',
        points: 'Reward Points',
        upcoming: 'Upcoming',
        available: 'available',
        save: 'Save',
        book_now: 'BOOK NOW',
        create_account: 'Create your account',
        already_have_account: 'Already have an account?',
        confirm_password: 'CONFIRM PASSWORD',
        full_name: 'FULL NAME',
        all: 'All',
        watched: 'Watched',
        cancelled: 'Cancelled',
        no_tickets_yet: 'No bookings yet',
        book_first_ticket: 'Book your first ticket and enjoy the cinema experience!',
        explore_movies: 'Explore Movies',
        room: 'ROOM',
        date: 'DATE',
        time: 'TIME',
        seats: 'SEATS',
        synopsis: 'SYNOPSIS',
        cast: 'CAST',
        director: 'DIRECTOR',
        producer: 'PRODUCER',
        format: 'FORMAT',
        share: 'SHARE',
        movie_desc_placeholder: 'Movie description is being updated. Stay tuned for this masterpiece at CINEVIET.',
        cast_placeholder: 'The cast list for this movie is currently being updated. Check back soon for details.',
        director_placeholder: 'CineViet Studios',
        producer_placeholder: 'Global Media Productions Inc.',
        seat_selection: 'SEAT SELECTION',
        theater_layout: 'THEATER LAYOUT',
        screen: 'SCREEN',
        legend: 'LEGEND',
        open: 'OPEN',
        sold: 'SOLD',
        vip: 'VIP',
        couple: 'COUPLE',
        selected: 'Selected: ',
        none: 'None',
        loading_theater: 'Loading Theater...',
        loading_movie: 'Loading Movie...',
        save_changes: 'SAVE CHANGES',
    },
    vi: {
        welcome: 'Chào mừng quay trở lại',
        signin_continue: 'Đăng nhập để tiếp tục',
        email: 'EMAIL',
        password: 'MẬT KHẨU',
        remember_me: 'Ghi nhớ đăng nhập',
        forgot_password: 'Quên mật khẩu?',
        signin: 'ĐĂNG NHẬP',
        no_account: 'Chưa có tài khoản?',
        signup: 'Đăng ký ngay',
        account: 'TÀI KHOẢN',
        personal_info: 'Thông tin cá nhân',
        notifications: 'Thông báo',
        language: 'Ngôn ngữ',
        security: 'Bảo mật',
        theme: 'Giao diện',
        rate_app: 'Đánh giá ứng dụng',
        support: 'Hỗ trợ khách hàng',
        sign_out: 'ĐĂNG XUẤT',
        now_showing: 'Phim đang chiếu',
        see_all: 'Xem tất cả',
        exclusive_offers: 'Voucher',
        hanoi: 'Hà Nội',
        search_placeholder: 'Tìm kiếm phim, thể loại...',
        movies: 'PHIM',
        tickets: 'VOUCHER',
        rating: 'ĐÁNH GIÁ',
        gold_member: 'Thành viên Vàng',
        my_tickets: 'Voucher của tôi',
        wallet: 'Ví CineViet',
        offers: 'Voucher',
        points: 'Điểm tích lũy',
        upcoming: 'Sắp tới',
        available: 'có sẵn',
        save: 'Tiết kiệm',
        book_now: 'ĐẶT VÉ NGAY',
        create_account: 'Tạo tài khoản mới',
        already_have_account: 'Đã có tài khoản?',
        confirm_password: 'XÁC NHẬN MẬT KHẨU',
        full_name: 'HỌ VÀ TÊN',
        all: 'Tất cả',
        watched: 'Đã xem',
        cancelled: 'Đã hủy',
        no_tickets_yet: 'Chưa có đơn đặt nào',
        book_first_ticket: 'Hãy đặt vé ngay để trải nghiệm điện ảnh tuyệt vời!',
        explore_movies: 'Khám phá phim ngay',
        room: 'PHÒNG',
        date: 'NGÀY',
        time: 'GIỜ',
        seats: 'GHẾ',
        synopsis: 'TÓM TẮT',
        cast: 'DIỄN VIÊN',
        director: 'ĐẠO DIỄN',
        producer: 'NHÀ SẢN XUẤT',
        format: 'ĐỊNH DẠNG',
        share: 'CHIA SẺ',
        movie_desc_placeholder: 'Mô tả phim đang được cập nhật. Hãy đón chờ siêu phẩm này tại CINEVIET.',
        cast_placeholder: 'Danh sách diễn viên đang được cập nhật. Vui lòng quay lại sau.',
        director_placeholder: 'Xưởng phim CineViet',
        producer_placeholder: 'Công ty sản xuất Global Media',
        seat_selection: 'CHỌN GHẾ',
        theater_layout: 'SƠ ĐỒ PHÒNG CHIẾU',
        screen: 'MÀN HÌNH',
        legend: 'CHÚ THÍCH',
        open: 'TRỐNG',
        sold: 'ĐÃ ĐẶT',
        vip: 'VIP',
        couple: 'GHẾ ĐÔI',
        selected: 'Đã chọn: ',
        none: 'Chưa có',
        loading_theater: 'Đang tải phòng chiếu...',
        loading_movie: 'Đang tải thông tin phim...',
        save_changes: 'LƯU THAY ĐỔI',
    }
};
