import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FirebaseError } from "firebase/app";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createUserDocument } from "../../api/users";
import { useAuth } from "../../contexts/AuthContext";
import { AuthStackParamList } from "../../types/navigation";
import { BACKEND_URL } from '@env';

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters long");
      return;
    }

    try {
      // 1. Créer l'utilisateur dans Firebase Auth
      const userCredential = await signUp(email, password);
      
      // 2. Obtenir le token d'authentification
      const token = await userCredential.user.getIdToken();
      
      console.log("Tentative de connexion à:", `${BACKEND_URL}/create_user`);
      
      // 3. Envoyer la requête avec le token dans le header
      const response = await fetch(`${BACKEND_URL}/create_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Ajout du token
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email,
        }),
      });

      console.log("Réponse status:", response.status);
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      Alert.alert("Success", "Account created successfully!");
    } catch (error) {
      console.error("Erreur complète:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password-new"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="password-new"
        />
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>
            Already have an account? Login here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
  },
});
