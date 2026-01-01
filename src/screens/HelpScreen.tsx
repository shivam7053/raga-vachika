import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Box, Heading, Text, VStack, Card } from '@gluestack-ui/themed';

export default function HelpScreen() {
  const { theme } = useTheme();

  return (
    <Box flex={1} backgroundColor={theme.background} p="$5">
      <Heading size="xl" color={theme.text} mb="$5">Help & Support</Heading>
      
      <VStack space="md">
        <Card p="$4" backgroundColor={theme.card}>
          <Heading size="sm" mb="$2" color={theme.text}>Contact Support</Heading>
          <Text color={theme.text}>
            If you have any issues, please email us at support@ragavachika.com
          </Text>
        </Card>

        <Card p="$4" backgroundColor={theme.card}>
          <Heading size="sm" mb="$2" color={theme.text}>About App</Heading>
          <Text color={theme.text}>Version: 1.0.0</Text>
          <Text color={theme.text} mt="$2">
            This is a learning platform built with React Native, Expo, and Firebase.
          </Text>
        </Card>
      </VStack>
    </Box>
  );
}
