import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function MovieManagementScreen({ navigation }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();

    useEffect(() => {
        loadMovies();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadMovies();
        });
        return unsubscribe;
    }, [navigation]);

    const loadMovies = async () => {
        try {
            const response = await api.getMovies();
            setMovies(response.data.data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load movies');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, title) => {
        Alert.alert(
            'Delete Movie',
            `Are you sure you want to delete "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteMovie(id);
                            loadMovies();
                            Alert.alert('Success', 'Movie deleted');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete movie');
                        }
                    },
                },
            ]
        );
    };

    const renderMovie = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.details}>{item.genre} • {item.duration} min</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('AddEditMovie', { movie: item })}
                >
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item._id, item.title)}
                >
                    <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#e50914" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Movie Management</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ShowtimeManagement')}
                        style={styles.headerButton}
                    >
                        <Text style={styles.headerButtonText}>Showtimes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={signOut} style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={movies}
                renderItem={renderMovie}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEditMovie', {})}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
    },
    header: {
        backgroundColor: '#e50914',
        padding: 15,
        paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    headerButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
    },
    headerButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    listContent: {
        padding: 15,
    },
    card: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    cardContent: {
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    details: {
        fontSize: 14,
        color: '#999',
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#4caf50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e50914',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    fabText: {
        fontSize: 30,
        color: '#fff',
    },
});
