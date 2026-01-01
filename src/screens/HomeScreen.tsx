import React, { useEffect, useState } from 'react';
import { FlatList, Alert, Platform } from 'react-native';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import PaymentModal from '../components/PaymentModal';
import { useTheme } from '../context/ThemeContext';
import { 
  Box, 
  Text, 
  Button, 
  ButtonText, 
  HStack, 
  Heading, 
  Card,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  ChevronDownIcon
} from '@gluestack-ui/themed';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
}

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { user, userProfile } = useAuth();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesList: Course[] = [];
        querySnapshot.forEach((doc) => {
          coursesList.push({ id: doc.id, ...doc.data() } as Course);
        });
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    };

    fetchCourses();
  }, []);

  const handleBuyPress = (course: Course) => {
    setSelectedCourse(course);
    setPaymentModalVisible(true);
  };

  const finalizePurchase = async () => {
    if (!selectedCourse || !user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        purchasedCourses: arrayUnion(selectedCourse.id)
      });
      setPaymentModalVisible(false);
      Alert.alert("Success", `You have purchased ${selectedCourse.title}!`);
    } catch (error: any) {
      Alert.alert("Purchase Failed", error.message);
    }
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    const isPurchased = userProfile?.purchasedCourses?.includes(item.id);

    return (
      <Card p="$4" borderRadius="$lg" maxWidth={360} m="$2" backgroundColor={theme.card}>
        <Heading size="md" mb="$1" color={theme.text}>{item.title}</Heading>
        <Text size="sm" mb="$2" color={theme.text}>{item.description}</Text>
        <Text size="md" fontWeight="bold" mb="$4" color={theme.text}>${item.price}</Text>
        
        {isPurchased ? (
          <Button 
            onPress={() => navigation.navigate('CourseClassroom', { courseId: item.id, courseTitle: item.title })} 
            bgColor={theme.primary}
          >
            <ButtonText>Open Classroom</ButtonText>
          </Button>
        ) : (
          <Button 
            onPress={() => handleBuyPress(item)} 
            bgColor={theme.primary}
          >
            <ButtonText>Buy Now</ButtonText>
          </Button>
        )}
      </Card>
    );
  };

  const filteredCourses = filter === 'purchased' 
    ? courses.filter(course => userProfile?.purchasedCourses?.includes(course.id))
    : courses;

  return (
    <Box flex={1} p="$5" backgroundColor={theme.background}>
      <HStack justifyContent="space-between" alignItems="center" mb="$4">
        <Heading size="xl" color={theme.text}>Courses</Heading>
        <Box width={160}>
          <Select selectedValue={filter} onValueChange={setFilter}>
            <SelectTrigger variant="outline" size="md" borderColor={theme.border}>
              <SelectInput placeholder="Select option" color={theme.text} />
              <SelectIcon as={ChevronDownIcon} mr="$3" color={theme.text} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label="All Courses" value="all" />
                <SelectItem label="My Courses" value="purchased" />
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>
      </HStack>
      
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderCourseItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        course={selectedCourse}
        onPaymentSuccess={finalizePurchase}
      />
    </Box>
  );
}