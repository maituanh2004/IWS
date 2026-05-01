import React, { useEffect } from 'react';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withDelay,
    withTiming,
    Easing
} from 'react-native-reanimated';

const AnimatedCard = ({ children, index = 0, delay = 100 }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        opacity.value = withDelay(index * delay, withTiming(1, { duration: 300 }));
        translateY.value = withDelay(index * delay, withSpring(0));
        scale.value = withDelay(index * delay, withSpring(1));
    }, [index, delay]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                { translateY: translateY.value },
                { scale: scale.value }
            ],
        };
    });

    return (
        <Animated.View style={animatedStyle}>
            {children}
        </Animated.View>
    );
};

export default AnimatedCard;
