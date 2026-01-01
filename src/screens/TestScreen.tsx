import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Box, VStack, Heading, Text, Button, ButtonText, Pressable } from '@gluestack-ui/themed';

export default function TestScreen({ route, navigation }: any) {
  const { courseId, testId } = route.params;
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const docRef = doc(db, 'courses', courseId, 'tests', testId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTest(docSnap.data());
        } else {
          setError("Test not found.");
        }
      } catch (err: any) {
        console.error("Error fetching test:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [courseId, testId]);

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const handleSubmit = async () => {
    let currentScore = 0;
    test.questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correctIndex) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
    
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'testResults', testId), {
          score: currentScore,
          totalQuestions: test.questions.length,
          courseId: courseId,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Error saving test result:", error);
      }
    }
  };

  if (loading) return <Box flex={1} p="$5" justifyContent="center"><Text>Loading...</Text></Box>;
  if (error) return <Box flex={1} p="$5" justifyContent="center"><Text color="$red500">Error: {error}</Text></Box>;
  if (!test) return <Box flex={1} p="$5" justifyContent="center"><Text>Test data is missing.</Text></Box>;

  if (submitted) {
    return (
      <Box flex={1} backgroundColor={theme.background} p="$5" justifyContent="center" alignItems="center">
        <Heading size="2xl" color={theme.text} mb="$4">Test Completed</Heading>
        <Text size="lg" color={theme.text} mb="$2">Your Score</Text>
        <Heading size="4xl" color={theme.primary} mb="$6">{score} / {test.questions.length}</Heading>
        <Button onPress={() => navigation.goBack()} bgColor={theme.primary}>
          <ButtonText>Back to Classroom</ButtonText>
        </Button>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor={theme.background}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Heading size="xl" mb="$5" color={theme.text}>{test.title}</Heading>
        
        {test.questions.map((q: any, index: number) => (
          <VStack key={index} mb="$5">
            <Text size="lg" fontWeight="bold" mb="$2" color={theme.text}>{index + 1}. {q.question}</Text>
            {q.options.map((opt: string, oIndex: number) => {
              const isSelected = answers[index] === oIndex;
              const isCorrect = q.correctIndex === oIndex;
              let bgColor = theme.card;
              
              if (submitted) {
                if (isCorrect) bgColor = '$green100';
                else if (isSelected && !isCorrect) bgColor = '$red100';
              } else if (isSelected) {
                bgColor = '$coolGray200';
              }

              return (
                <Pressable 
                  key={oIndex} 
                  p="$3" 
                  mb="$2" 
                  borderWidth={1} 
                  borderColor={theme.border} 
                  borderRadius="$md"
                  bg={bgColor}
                  onPress={() => handleSelectOption(index, oIndex)}
                >
                  <Text color={submitted && (isCorrect || (isSelected && !isCorrect)) ? '$black' : theme.text}>{opt}</Text>
                </Pressable>
              );
            })}
          </VStack>
        ))}

        <Button onPress={handleSubmit} bgColor={theme.primary}>
          <ButtonText>Submit Test</ButtonText>
        </Button>
      </ScrollView>
    </Box>
  );
}