import React, { useState } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Box, VStack, Heading, Input, InputField, Textarea, TextareaInput, Button, ButtonText, Spinner } from '@gluestack-ui/themed';

export default function CreateCourseScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleCreateCourse = async () => {
    if (!title || !description || !price) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'courses'), {
        title,
        description,
        price: parseFloat(price), // Store price as a number
      });
      Alert.alert('Success', 'Course created successfully!');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} p="$5" backgroundColor={theme.background}>
      <Heading size="xl" mb="$5" color={theme.text}>Create a New Course</Heading>
      
      <VStack space="md">
        <Input variant="outline" size="md" borderColor={theme.border}>
          <InputField 
            placeholder="Course Title" 
            value={title} 
            onChangeText={setTitle} 
            color={theme.text} 
            placeholderTextColor={theme.placeholder} 
          />
        </Input>

        <Textarea size="md" borderColor={theme.border}>
          <TextareaInput 
            placeholder="Course Description" 
            value={description} 
            onChangeText={setDescription} 
            color={theme.text} 
            placeholderTextColor={theme.placeholder} 
          />
        </Textarea>

        <Input variant="outline" size="md" borderColor={theme.border}>
          <InputField 
            placeholder="Price (e.g., 19.99)" 
            value={price} 
            onChangeText={setPrice} 
            keyboardType="numeric" 
            color={theme.text} 
            placeholderTextColor={theme.placeholder} 
          />
        </Input>

        {loading ? (
          <Spinner size="large" color={theme.primary} />
        ) : (
          <Button onPress={handleCreateCourse} bgColor={theme.primary}>
            <ButtonText>Create Course</ButtonText>
          </Button>
        )}
      </VStack>
    </Box>
  );
}
