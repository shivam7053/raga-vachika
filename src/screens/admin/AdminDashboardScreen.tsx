import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { Box, Text, Button, ButtonText, VStack, Heading } from '@gluestack-ui/themed';

// Define your stack param list if you have one, otherwise use a generic
type AdminStackParamList = {
  CreateCourse: undefined;
  AdminDashboard: undefined;
  AddLesson: undefined;
  CreateTest: undefined;
  SendNotification: undefined;
};

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

export default function AdminDashboardScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { theme } = useTheme();

  return (
    <Box flex={1} p="$5" alignItems="center" backgroundColor={theme.background}>
      <Heading size="xl" mb="$2" color={theme.text}>Admin Dashboard</Heading>
      <Text size="md" color="$coolGray500" mb="$8">Manage Courses, Users, and Tests from here.</Text>
      
      <VStack space="md" width="100%">
        <Button onPress={() => navigation.navigate('CreateCourse')} bgColor={theme.primary}>
          <ButtonText>Create New Course</ButtonText>
        </Button>
        
        <Button onPress={() => navigation.navigate('AddLesson')} bgColor={theme.primary}>
          <ButtonText>Add Content (Video/Notes)</ButtonText>
        </Button>

        <Button onPress={() => navigation.navigate('CreateTest')} bgColor={theme.primary}>
          <ButtonText>Create Test</ButtonText>
        </Button>

        <Button onPress={() => navigation.navigate('SendNotification')} bgColor={theme.primary}>
          <ButtonText>Send Notification</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
