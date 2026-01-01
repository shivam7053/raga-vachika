import React, { useState, useEffect } from 'react';
import { Alert, ScrollView } from 'react-native';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { Box, VStack, Heading, Text, Input, InputField, Button, ButtonText, HStack, Pressable, Card } from '@gluestack-ui/themed';

export default function CreateTestScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([
    { question: '', options: ['', '', '', ''], correctIndex: 0 }
  ]);
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

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }]);
  };

  const updateQuestion = (index: number, field: string, value: any, optionIndex?: number) => {
    const newQuestions = [...questions];
    const updatedQuestion = { ...newQuestions[index] };

    if (field === 'question') {
      updatedQuestion.question = value;
    } else if (field === 'option' && optionIndex !== undefined) {
      const newOptions = [...updatedQuestion.options];
      newOptions[optionIndex] = value;
      updatedQuestion.options = newOptions;
    } else if (field === 'correctIndex') {
      updatedQuestion.correctIndex = value;
    }
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const handleSaveTest = async () => {
    console.log("Attempting to save test...");
    console.log("Selected Course ID:", selectedCourseId);
    console.log("Test Title:", testTitle);
    console.log("Questions:", JSON.stringify(questions));

    if (!selectedCourseId) {
      Alert.alert('Validation Error', 'Please select a course from the list.');
      return;
    }
    if (!testTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the test.');
      return;
    }

    setLoading(true);
    try {
      console.log("Writing to Firestore...");
      await addDoc(collection(db, 'courses', selectedCourseId, 'tests'), {
        title: testTitle,
        questions: questions
      });
      console.log("Test saved successfully.");
      Alert.alert('Success', 'Test created successfully!');
      setTestTitle('');
      setQuestions([{ question: '', options: ['', '', '', ''], correctIndex: 0 }]);
    } catch (error: any) {
      console.error("Error saving test:", error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} backgroundColor={theme.background}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        <Heading size="xl" mb="$5" color={theme.text}>Create Test</Heading>
        
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

        <Input variant="outline" size="md" mb="$5" borderColor={theme.border}>
          <InputField placeholder="Test Title" value={testTitle} onChangeText={setTestTitle} color={theme.text} placeholderTextColor={theme.placeholder} />
        </Input>

        {questions.map((q, qIndex) => (
          <Card key={qIndex} p="$4" mb="$4" backgroundColor={theme.card}>
            <Heading size="sm" mb="$2" color={theme.text}>Question {qIndex + 1}</Heading>
            <Input variant="outline" size="sm" mb="$3" borderColor={theme.border}>
              <InputField placeholder="Question Text" value={q.question} onChangeText={(text) => updateQuestion(qIndex, 'question', text)} color={theme.text} placeholderTextColor={theme.placeholder} />
            </Input>
            
            {q.options.map((opt: string, oIndex: number) => (
              <HStack key={oIndex} alignItems="center" mb="$2" space="sm">
                <Input variant="outline" size="sm" flex={1} borderColor={theme.border}>
                  <InputField placeholder={`Option ${oIndex + 1}`} value={opt} onChangeText={(text) => updateQuestion(qIndex, 'option', text, oIndex)} color={theme.text} placeholderTextColor={theme.placeholder} />
                </Input>
                <Pressable onPress={() => updateQuestion(qIndex, 'correctIndex', oIndex)}>
                  <Box 
                    w="$6" h="$6" 
                    borderRadius="$full" 
                    borderWidth={2} 
                    borderColor={q.correctIndex === oIndex ? '$green500' : theme.text}
                    bg={q.correctIndex === oIndex ? '$green500' : 'transparent'}
                  />
                </Pressable>
              </HStack>
            ))}
          </Card>
        ))}

        <Button onPress={addQuestion} variant="outline" mb="$4" borderColor={theme.primary}>
          <ButtonText color={theme.primary}>Add Another Question</ButtonText>
        </Button>
        
        <Button onPress={handleSaveTest} isDisabled={loading} bgColor={theme.primary}>
          <ButtonText>{loading ? "Saving..." : "Save Test"}</ButtonText>
        </Button>
      </ScrollView>
    </Box>
  );
}