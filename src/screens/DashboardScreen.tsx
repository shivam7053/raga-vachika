import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Box, Heading, Text, Button, ButtonText, Center, VStack } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const { userProfile } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <Box flex={1} backgroundColor={theme.background} p="$5" justifyContent="center">
      <Center>
        <Heading size="2xl" color={theme.text} mb="$4" textAlign="center">
          Welcome, {userProfile?.name || userProfile?.email?.split('@')[0]}!
        </Heading>
        <Text color={theme.text} textAlign="center" mb="$8">
          Your journey to knowledge starts here.
        </Text>
        
        <VStack space="md" width="100%" maxWidth={300}>
          <Button onPress={() => navigation.navigate('Courses')} bgColor={theme.primary}>
            <ButtonText>Browse Courses</ButtonText>
          </Button>

          {Platform.OS === 'web' && userProfile?.role === 'admin' && (
            <Button onPress={() => navigation.navigate('Admin')} variant="outline" borderColor={theme.primary}>
              <ButtonText color={theme.primary}>Go to Admin Dashboard</ButtonText>
            </Button>
          )}
        </VStack>
      </Center>
    </Box>
  );
}
