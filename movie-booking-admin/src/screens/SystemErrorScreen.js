import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, ServerCrash, AlertTriangle, Home, RefreshCcw } from 'lucide-react-native';
import BackgroundWrapper from '../components/BackgroundWrapper';

const SystemErrorScreen = ({ route, navigation }) => {
    const { errorType = 'generic' } = route.params || {};

    const errorConfigs = {
        '404': {
            title: '404',
            subtitle: 'Scene Not Found',
            message: "The reel you're looking for seems to have been misplaced by our projectionist.",
            icon: Search,
            color: '#c04444',
        },
        '500': {
            title: '500',
            subtitle: 'Projector Malfunction',
            message: "Our servers hit a technical snag. We're working on fixing the light bulbs.",
            icon: ServerCrash,
            color: '#c04444',
        },
        'generic': {
            title: 'Error',
            subtitle: 'Unexpected Plot Twist',
            message: "Something went wrong in the middle of the show. Please try again later.",
            icon: AlertTriangle,
            color: '#c04444',
        }
    };

    const config = errorConfigs[errorType] || errorConfigs['generic'];
    const IconComponent = config.icon;

    return (
        <BackgroundWrapper>
            <View className="flex-1 justify-center items-center px-8">
                {/* Background Large Text Decor */}
                <Text style={{ position: 'absolute', fontSize: 180, fontWeight: '900', color: '#fff', top: '20%', opacity: 0.03 }}>
                    {config.title}
                </Text>

                <View className="items-center z-10 w-full">
                    <View className="bg-black/40 p-10 rounded-[50px] shadow-2xl border border-white/10 mb-10">
                        <IconComponent color={config.color} size={84} strokeWidth={1.5} />
                    </View>

                    <Text className="text-4xl font-black text-white mb-4 text-center tracking-tighter italic">
                        {config.subtitle}
                    </Text>

                    <Text className="text-base text-gray-400 text-center mb-16 leading-6 font-black uppercase tracking-widest px-4 opacity-60">
                        {config.message}
                    </Text>

                    <TouchableOpacity
                        className="bg-[#c04444] w-full py-6 rounded-[24px] flex-row justify-center items-center shadow-2xl shadow-[#c04444]/40 mb-5"
                        onPress={() => navigation.navigate('MovieManagement')}
                    >
                        <Home color="#fff" size={22} />
                        <Text className="text-white font-black text-xl ml-3 uppercase tracking-widest">Return Base</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white/5 border border-white/10 w-full py-6 rounded-[24px] flex-row justify-center items-center active:bg-white/10"
                        onPress={() => navigation.goBack()}
                    >
                        <RefreshCcw color="#fff" size={22} />
                        <Text className="text-white font-black text-xl ml-3 uppercase tracking-widest">Retry Scene</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BackgroundWrapper>
    );
};

export default SystemErrorScreen;
