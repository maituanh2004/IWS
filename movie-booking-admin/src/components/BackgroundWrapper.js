import React, { useEffect } from 'react';
import { View, ImageBackground, StyleSheet, StatusBar } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withSequence, 
    withTiming 
} from 'react-native-reanimated';

export default function BackgroundWrapper({ children }) {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 15000 }),
                withTiming(1, { duration: 15000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                    <ImageBackground 
                        source={require('../../assets/bg.png')} 
                        style={styles.bg}
                        resizeMode="cover"
                    />
                </Animated.View>
            </View>
            {/* Global subtle overlay to ensure readability */}
            <View style={styles.overlay} />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    bg: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)', // Darken the image slightly for text contrast
    }
});
