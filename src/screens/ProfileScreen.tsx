import React, { useEffect, useState } from 'react';
import { FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { documentId, where, query, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useTheme } from '../context/ThemeContext';
import { Box, VStack, Heading, Text, Spinner, Card, HStack, Button, ButtonText, Input, InputField } from '@gluestack-ui/themed';

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth();
  const [purchasedCoursesList, setPurchasedCoursesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (userProfile?.purchasedCourses && userProfile.purchasedCourses.length > 0) {
        try {
          // Fetch courses where the document ID is in the user's purchased list
          const q = query(
            collection(db, 'courses'), 
            where(documentId(), 'in', userProfile.purchasedCourses)
          );
          const querySnapshot = await getDocs(q);
          const courses: any[] = [];
          querySnapshot.forEach((doc) => {
            courses.push({ id: doc.id, ...doc.data() });
          });
          setPurchasedCoursesList(courses);
        } catch (error) {
          console.error("Error fetching purchased courses:", error);
        }
      } else {
        setPurchasedCoursesList([]);
      }
      setLoading(false);
    };

    fetchPurchasedCourses();
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setState(userProfile.state || '');
      setCity(userProfile.city || '');
      setDob(userProfile.dob || '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name,
        state,
        city,
        dob
      });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Box flex={1} p="$5" backgroundColor={theme.background}>
      <Card p="$5" mb="$5" backgroundColor={theme.card}>
        <Heading size="lg" mb="$4" textAlign="center" color={theme.text}>My Profile</Heading>
        <HStack mb="$2">
          <Text fontWeight="bold" width={60} color={theme.text}>Email:</Text>
          <Text flex={1} color={theme.text}>{userProfile?.email}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="bold" width={60} color={theme.text}>Role:</Text>
          <Text flex={1} color={theme.text}>{userProfile?.role}</Text>
        </HStack>

        <VStack space="sm" mt="$4">
          <Text fontWeight="bold" color={theme.text}>Edit Profile (Optional)</Text>
          
          <Input variant="outline" size="sm" borderColor={theme.border}>
            <InputField placeholder="Full Name" value={name} onChangeText={setName} color={theme.text} placeholderTextColor={theme.placeholder} />
          </Input>

          <HStack space="sm">
            <Input variant="outline" size="sm" flex={1} borderColor={theme.border}>
              <InputField placeholder="State" value={state} onChangeText={setState} color={theme.text} placeholderTextColor={theme.placeholder} />
            </Input>
            <Input variant="outline" size="sm" flex={1} borderColor={theme.border}>
              <InputField placeholder="City" value={city} onChangeText={setCity} color={theme.text} placeholderTextColor={theme.placeholder} />
            </Input>
          </HStack>

          <Input variant="outline" size="sm" borderColor={theme.border}>
            <InputField placeholder="Date of Birth (DD/MM/YYYY)" value={dob} onChangeText={setDob} color={theme.text} placeholderTextColor={theme.placeholder} />
          </Input>

          <Button 
            onPress={handleUpdateProfile} 
            size="sm" 
            mt="$2" 
            bgColor={theme.primary}
            isDisabled={updating}
          >
            <ButtonText>{updating ? "Saving..." : "Save Profile"}</ButtonText>
          </Button>
        </VStack>
      </Card>

      <Heading size="lg" mb="$4" color={theme.text}>My Purchased Courses</Heading>
      <FlatList
        data={purchasedCoursesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card p="$4" mb="$3" backgroundColor={theme.card}>
            <Heading size="md" mb="$1" color={theme.text}>{item.title}</Heading>
            <Text color="$coolGray500">{item.description}</Text>
          </Card>
        )}
        ListEmptyComponent={<Text textAlign="center" mt="$5" color="$coolGray500">No courses purchased yet.</Text>}
      />

      <Button onPress={logout} action="negative" mb="$5">
        <ButtonText>Logout</ButtonText>
      </Button>
    </Box>
  );
}