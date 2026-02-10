import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            console.log("🔵 SENDING LOGIN REQUEST...");

            const result = await signIn(email, password);

            console.log("🟢 LOGIN SUCCESS:", result);
            Alert.alert("Success", "Login successful!");

        } catch (error) {
            console.log("🔴 LOGIN ERROR RAW:", error);

            if (error.response) {
                console.log("🔴 SERVER RESPONSE:", error.response.data);

                const message =
                    error.response.data?.error ||
                    error.response.data?.message ||
                    "Invalid email or password";

                Alert.alert("Login Failed", message);
            }
            else if (error.request) {
                console.log("🔴 REQUEST ERROR:", error.request);
                Alert.alert("Network Error", "Cannot reach the server");
            }
            else {
                console.log("🔴 UNKNOWN ERROR:", error.message);
                Alert.alert("Error", error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Panel</Text>
            <Text style={styles.subtitle}>Movie Booking System</Text>

            <TextInput
                style={styles.input}
                placeholder="Admin Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Login</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#c04444ff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#f1f1f1ff',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        backgroundColor: '#faf5f5ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        color: '#403737ff',
    },
    button: {
        backgroundColor: '#e50914',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
