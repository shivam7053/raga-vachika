import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Linking, Alert } from 'react-native';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Box, VStack, Heading, Text, Button, ButtonText, HStack, Spinner, Card, Pressable, Icon, PlayIcon, EditIcon } from '@gluestack-ui/themed';
import ClassroomPlayer from '../components/ClassroomPlayer';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'note';
  videoId?: string;
  url?: string;
  order: number;
}

interface Test {
  id: string;
  title: string;
  questions: any[];
}

export default function CourseClassroomScreen({ route }: any) {
  if (!route.params) {
    return <Box flex={1} justifyContent="center" alignItems="center"><Text>Error: Course information is missing.</Text></Box>;
  }
  const { courseId, courseTitle } = route.params;
  const [activeTab, setActiveTab] = useState<'classes' | 'notes' | 'tests'>('classes');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const navigation = useNavigation<any>();
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
    const fetchData = async () => {
      try {
        // Fetch lessons from the subcollection 'lessons' inside the course
        const q = query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc'));
        const lessonsSnapshot = await getDocs(q);
        const lessonsList: Lesson[] = [];
        lessonsSnapshot.forEach((doc) => {
          lessonsList.push({ id: doc.id, ...doc.data() } as Lesson);
        });
        setLessons(lessonsList);

        // Set active lesson if none is active or if the current one is from another course
        setActiveLesson((prevActiveLesson) => {
          if (!prevActiveLesson || !lessonsList.some(l => l.id === prevActiveLesson.id)) {
            const firstVideo = lessonsList.find(l => l.type === 'video');
            return firstVideo || null;
          }
          return prevActiveLesson;
        });

        // Fetch tests
        const testsSnapshot = await getDocs(collection(db, 'courses', courseId, 'tests'));
        const testsList: Test[] = [];
        testsSnapshot.forEach((doc) => {
          testsList.push({ id: doc.id, ...doc.data() } as Test);
        });
        setTests(testsList);

        // Fetch results for these tests
        if (user) {
          const results: {[key: string]: any} = {};
          await Promise.all(testsList.map(async (t) => {
            try {
              const resSnap = await getDoc(doc(db, 'users', user.uid, 'testResults', t.id));
              if (resSnap.exists()) {
                results[t.id] = resSnap.data();
              }
            } catch (e) { console.log("Error fetching result", e); }
          }));
          setTestResults(results);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user])
  );

  const renderLessonItem = ({ item }: { item: Lesson }) => {
    // Filter content based on active tab
    if (activeTab === 'classes' && item.type !== 'video') return null;
    if (activeTab === 'notes' && item.type !== 'note') return null;

    const isActive = activeLesson?.id === item.id;

    return (
      <Pressable 
        onPress={() => {
          if (item.type === 'video') setActiveLesson(item);
          else if (item.url) Linking.openURL(item.url);
        }}
      >
        <Card 
          p="$4" 
          mb="$3" 
          backgroundColor={isActive ? (isDark ? '$slate700' : '$coolGray100') : theme.card} 
          borderColor={isActive ? theme.primary : 'transparent'}
          borderWidth={isActive ? 1 : 0}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack space="md" alignItems="center" flex={1}>
            <Box p="$2" bg={isActive ? theme.primary : '$coolGray200'} borderRadius="$full">
              <Icon as={item.type === 'video' ? PlayIcon : EditIcon} color={isActive ? '$white' : '$coolGray500'} size="sm" />
            </Box>
            <VStack flex={1}>
              <Heading size="sm" color={theme.text} numberOfLines={1}>{item.title}</Heading>
              <Text size="xs" color="$coolGray500">{item.type === 'video' ? 'Video Lesson' : 'PDF Note'}</Text>
            </VStack>
          </HStack>
          
          {isActive && <Text size="xs" color={theme.primary} fontWeight="bold">Playing</Text>}
        </Card>
      </Pressable>
    );
  };

  const renderTestItem = ({ item }: { item: Test }) => {
    const result = testResults[item.id];
    return (
      <Card p="$4" mb="$4" backgroundColor={theme.card}>
        <Heading size="md" mb="$2" color={theme.text}>{item.title}</Heading>
        <Text mb="$2" color={theme.text}>{item.questions?.length || 0} Questions</Text>
        {result && (
          <Text mb="$2" color="$green600" fontWeight="bold">
            Last Score: {result.score}/{result.totalQuestions}
          </Text>
        )}
        <Button 
          onPress={() => navigation.navigate('Test', { courseId, testId: item.id })} 
          bgColor={theme.primary}
        >
          <ButtonText>{result ? "Retake Test" : "Start Test"}</ButtonText>
        </Button>
      </Card>
    );
  };

  return (
    <Box flex={1} p="$4" backgroundColor={theme.background}>
      {/* Active Player Section */}
      {activeLesson && activeLesson.type === 'video' && activeLesson.videoId && (
        <ClassroomPlayer 
          courseId={courseId}
          lessonId={activeLesson.id}
          videoId={activeLesson.videoId}
          title={activeLesson.title}
        />
      )}
      
      {!activeLesson && <Heading size="xl" textAlign="center" mb="$4" color={theme.text}>{courseTitle}</Heading>}
      
      <HStack mb="$4" space="sm" justifyContent="center">
        <Button 
          variant={activeTab === 'classes' ? 'solid' : 'outline'} 
          onPress={() => setActiveTab('classes')}
          bgColor={activeTab === 'classes' ? theme.primary : 'transparent'}
          borderColor={theme.primary}
        >
          <ButtonText color={activeTab === 'classes' ? '$white' : theme.primary}>Classes</ButtonText>
        </Button>
        <Button 
          variant={activeTab === 'notes' ? 'solid' : 'outline'} 
          onPress={() => setActiveTab('notes')}
          bgColor={activeTab === 'notes' ? theme.primary : 'transparent'}
          borderColor={theme.primary}
        >
          <ButtonText color={activeTab === 'notes' ? '$white' : theme.primary}>Notes</ButtonText>
        </Button>
        <Button 
          variant={activeTab === 'tests' ? 'solid' : 'outline'} 
          onPress={() => setActiveTab('tests')}
          bgColor={activeTab === 'tests' ? theme.primary : 'transparent'}
          borderColor={theme.primary}
        >
          <ButtonText color={activeTab === 'tests' ? '$white' : theme.primary}>Tests</ButtonText>
        </Button>
      </HStack>

      {loading ? (
        <Spinner size="large" mt="$5" />
      ) : (
        <FlatList
          data={(activeTab === 'tests' ? tests : lessons) as any}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'tests' ? (renderTestItem as any) : (renderLessonItem as any)}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text textAlign="center" mt="$5" color={theme.text}>No content available yet.</Text>}
        />
      )}
    </Box>
  );
}