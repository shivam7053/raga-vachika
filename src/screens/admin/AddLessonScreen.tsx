import React, { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { Box, VStack, Heading, Text, Input, InputField, Button, ButtonText, HStack } from '@gluestack-ui/themed';

export default function AddLessonScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [contentUrl, setContentUrl] = useState(''); // YouTube ID or Drive Link
  const [type, setType] = useState<'video' | 'note'>('video');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCourses = async () => {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const list: any[] = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setCourses(list);
    };
    fetchCourses();
  }, []);

  const handleAddLesson = async () => {
    if (!selectedCourseId || !title || !contentUrl) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      let finalContent = contentUrl;

      // If it's a video, try to extract the ID from a potential URL
      if (type === 'video') {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = contentUrl.match(regExp);
        if (match && match[2].length === 11) {
          finalContent = match[2];
        }
      }

      // Add to subcollection 'lessons'
      await addDoc(collection(db, 'courses', selectedCourseId, 'lessons'), {
        title,
        type,
        videoId: type === 'video' ? finalContent : null, 
        url: type === 'note' ? finalContent : null,
        order: Date.now() // Simple ordering
      });
      Alert.alert("Success", "Lesson added!");
      setTitle('');
      setContentUrl('');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor={theme.background}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Heading size="xl" mb="$5" color={theme.text}>Add Content to Course</Heading>

        <Text fontWeight="bold" mb="$2" color={theme.text}>Select Course:</Text>
        <HStack space="sm" flexWrap="wrap" mb="$5">
          {courses.map((course) => (
            <Button 
              key={course.id}
              size="sm" 
              variant={selectedCourseId === course.id ? 'solid' : 'outline'}
              onPress={() => setSelectedCourseId(course.id)}
              mb="$2"
              bgColor={selectedCourseId === course.id ? theme.primary : 'transparent'}
              borderColor={theme.primary}
            >
              <ButtonText color={selectedCourseId === course.id ? '$white' : theme.primary}>{course.title}</ButtonText>
            </Button>
          ))}
        </HStack>

        {selectedCourseId && (
          <VStack space="md">
            <Text fontWeight="bold" color={theme.text}>Content Type:</Text>
            <HStack space="md" mb="$2">
              <Button 
                size="sm" 
                variant={type === 'video' ? 'solid' : 'outline'} 
                onPress={() => setType('video')}
                bgColor={type === 'video' ? theme.primary : 'transparent'}
                borderColor={theme.primary}
              >
                <ButtonText color={type === 'video' ? '$white' : theme.primary}>Video</ButtonText>
              </Button>
              <Button 
                size="sm" 
                variant={type === 'note' ? 'solid' : 'outline'} 
                onPress={() => setType('note')}
                bgColor={type === 'note' ? theme.primary : 'transparent'}
                borderColor={theme.primary}
              >
                <ButtonText color={type === 'note' ? '$white' : theme.primary}>Note</ButtonText>
              </Button>
            </HStack>

            <Input variant="outline" size="md" borderColor={theme.border}>
              <InputField placeholder="Lesson Title" value={title} onChangeText={setTitle} color={theme.text} placeholderTextColor={theme.placeholder} />
            </Input>

            <Input variant="outline" size="md" borderColor={theme.border}>
              <InputField 
                placeholder={type === 'video' ? "YouTube Video ID (e.g. dQw4w9WgXcQ)" : "Google Drive Link"} 
                value={contentUrl} 
                onChangeText={setContentUrl} 
                color={theme.text} 
                placeholderTextColor={theme.placeholder} 
              />
            </Input>

            <Button onPress={handleAddLesson} isDisabled={loading} bgColor={theme.primary}>
              <ButtonText>{loading ? "Adding..." : "Add Lesson"}</ButtonText>
            </Button>
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}