import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

export default function MovieDetailScreen({ route, navigation }) {
    const { movie } = route.params;

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: movie.poster }} style={styles.poster} />

            <View style={styles.content}>
                <Text style={styles.title}>{movie.title}</Text>

                <View style={styles.metaInfo}>
                    <Text style={styles.metaText}>Genre: {movie.genre}</Text>
                    <Text style={styles.metaText}>Duration: {movie.duration} min</Text>
                    <Text style={styles.metaText}>
                        Release: {new Date(movie.releaseDate).toLocaleDateString()}
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{movie.description}</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('ShowtimeList', { movie })}
                >
                    <Text style={styles.buttonText}>View Showtimes</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    poster: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    metaInfo: {
        marginBottom: 20,
    },
    metaText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#e50914',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
