import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, ServerCrash, AlertTriangle, Home, RefreshCcw } from 'lucide-react-native';

const SystemErrorScreen = ({ route, navigation }) => {
    const { errorType = 'generic' } = route.params || {};

    const errorConfigs = {
        '404': {
            title: '404',
            subtitle: 'SCENE NOT FOUND',
            message: "The reel you're looking for seems to have been misplaced by our projectionist.",
            icon: Search,
            accent: '#FF4444',
        },
        '500': {
            title: '500',
            subtitle: 'PROJECTOR MALFUNCTION',
            message: "Our servers hit a technical snag. We're working on fixing the light bulbs.",
            icon: ServerCrash,
            accent: '#FF4444',
        },
        'generic': {
            title: '!',
            subtitle: 'UNEXPECTED PLOT TWIST',
            message: "Something went wrong in the middle of the show. Please try again later.",
            icon: AlertTriangle,
            accent: '#FF4444',
        }
    };

    const config = errorConfigs[errorType] || errorConfigs['generic'];
    const IconComponent = config.icon;

    return (
        <View className="flex-1 bg-[#0A0A0F] justify-center items-center px-8">
            {/* Background Glow */}
            <View
                className="absolute w-64 h-64 rounded-full opacity-10"
                style={{ backgroundColor: config.accent, top: '25%' }}
            />

            <Text className="absolute text-[160px] font-black text-white/5 top-[15%] italic">
                {config.title}
            </Text>

            <View className="items-center z-10 w-full">
                <View className="bg-[#141420] p-10 rounded-[40px] shadow-2xl border border-white/5 mb-10">
                    <IconComponent color={config.accent} size={64} strokeWidth={1.5} />
                </View>

                <Text className="text-3xl font-black text-white mb-3 text-center tracking-tighter italic uppercase">
                    {config.subtitle}
                </Text>

                <Text className="text-gray-500 text-center mb-16 leading-6 font-medium tracking-wide px-4">
                    {config.message}
                </Text>

                <TouchableOpacity
                    className="w-full mb-4 rounded-2xl overflow-hidden shadow-lg shadow-black/20"
                    onPress={() => navigation.navigate('MovieList')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#00D4FF', '#00AACC']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        className="py-5 flex-row justify-center items-center"
                    >
                        <Home color="#0A0A0F" size={20} />
                        <Text className="text-[#0A0A0F] font-black text-base ml-3 uppercase tracking-widest">Return Home</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white/5 border border-white/10 w-full py-5 rounded-2xl flex-row justify-center items-center active:bg-white/10"
                    onPress={() => navigation.goBack()}
                >
                    <RefreshCcw color="#AAA" size={20} />
                    <Text className="text-gray-300 font-bold text-base ml-3 uppercase tracking-widest">Retry Scene</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SystemErrorScreen;
