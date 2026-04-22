import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Search, ServerCrash, AlertTriangle, Home, RefreshCcw } from 'lucide-react-native';

const SystemErrorScreen = ({ route, navigation }) => {
    const { errorType = 'generic' } = route.params || {};

    const errorConfigs = {
        '404': {
            title: '404',
            subtitle: 'Scene Not Found',
            message: "The reel you're looking for seems to have been misplaced by our projectionist.",
            icon: Search,
            color: '#e50914',
        },
        '500': {
            title: '500',
            subtitle: 'Projector Malfunction',
            message: "Our servers hit a technical snag. We're working on fixing the light bulbs.",
            icon: ServerCrash,
            color: '#e50914',
        },
        'generic': {
            title: 'Error',
            subtitle: 'Unexpected Plot Twist',
            message: "Something went wrong in the middle of the show. Please try again later.",
            icon: AlertTriangle,
            color: '#e50914',
        }
    };

    const config = errorConfigs[errorType] || errorConfigs['generic'];
    const IconComponent = config.icon;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 justify-center items-center px-8">
                {/* Background Large Text Decor */}
                <Text style={{ position: 'absolute', fontSize: 150, fontWeight: '900', color: '#f3f4f6', top: '25%', opacity: 0.6 }}>
                    {config.title}
                </Text>

                <View className="items-center z-10 w-full">
                    <View className="bg-white p-7 rounded-[40px] shadow-2xl border border-gray-100 mb-8" style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 15 }}>
                        <IconComponent color={config.color} size={72} strokeWidth={1.5} />
                    </View>

                    <Text className="text-4xl font-black text-gray-900 mb-3 text-center tracking-tighter">
                        {config.subtitle}
                    </Text>

                    <Text className="text-base text-gray-500 text-center mb-16 leading-6 font-medium px-4">
                        {config.message}
                    </Text>

                    <TouchableOpacity
                        className="bg-[#e50914] w-full py-4.5 rounded-2xl flex-row justify-center items-center shadow-lg mb-4"
                        style={{ shadowColor: '#e50914', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 }}
                        onPress={() => navigation.navigate('MovieManagement')}
                    >
                        <Home color="#fff" size={22} />
                        <Text className="text-white font-black text-xl ml-3">Take Me Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white border-2 border-gray-200 w-full py-4.5 rounded-2xl flex-row justify-center items-center"
                        onPress={() => navigation.goBack()}
                    >
                        <RefreshCcw color="#6b7280" size={22} />
                        <Text className="text-gray-600 font-bold text-xl ml-3">Retry Action</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SystemErrorScreen;
