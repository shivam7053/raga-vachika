import React, { useState } from 'react';
import { Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { 
  Box, 
  Text, 
  Input, 
  InputField, 
  Button, 
  ButtonText, 
  VStack, 
  Heading, 
  Spinner,
  Center
} from '@gluestack-ui/themed';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and SignUp
  const { theme } = useTheme();

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'student',
        });
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} justifyContent="center" p="$5" backgroundColor={theme.background}>
      <Center>
        <Heading size="xl" mb="$6" color={theme.text}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Heading>
      </Center>
      
      <VStack space="md">
        <Input variant="outline" size="md" isDisabled={false} isInvalid={false} isReadOnly={false} borderColor={theme.border}>
          <InputField 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            color={theme.text}
            placeholderTextColor={theme.placeholder}
          />
        </Input>

        <Input variant="outline" size="md" borderColor={theme.border}>
          <InputField 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            color={theme.text}
            placeholderTextColor={theme.placeholder}
          />
        </Input>

        {loading ? (
          <Spinner size="large" color={theme.primary} />
        ) : (
          <VStack space="sm" mt="$4">
            <Button onPress={handleAuth} bgColor={theme.primary}>
              <ButtonText>{isLogin ? "Login" : "Sign Up"}</ButtonText>
            </Button>
            <Button 
              onPress={() => setIsLogin(!isLogin)} 
              variant="link"
            >
              <ButtonText color="$coolGray500">
                {isLogin ? "Need an account? Sign Up" : "Have an account? Login"}
              </ButtonText>
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
