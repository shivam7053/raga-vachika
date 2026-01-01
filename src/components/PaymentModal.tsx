import React from 'react';
import { Modal, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Box, Heading, Text, Button, ButtonText, VStack, Pressable, Center } from '@gluestack-ui/themed';

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  course: Course | null;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ visible, onClose, course, onPaymentSuccess }: PaymentModalProps) {
  const { theme } = useTheme();
  const processPayment = (method: 'dummy' | 'razorpay') => {
    if (!course) return;

    if (method === 'razorpay') {
      Alert.alert("Razorpay", "Redirecting to Secure Payment Gateway...", [
        { text: "Cancel", style: "cancel" },
        { text: "Simulate Success", onPress: () => onPaymentSuccess() }
      ]);
      return;
    }

    // Dummy payment is instant
    onPaymentSuccess();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Center flex={1} bg="rgba(0,0,0,0.5)">
        <Box width="85%" bg={theme.card} p="$6" borderRadius="$xl" shadowColor="$black" shadowOpacity={0.25} shadowRadius={4} elevation={5}>
          <Heading size="lg" mb="$2" color={theme.text}>Complete Purchase</Heading>
          <Text mb="$1" color={theme.text}>Course: {course?.title}</Text>
          <Text size="xl" fontWeight="bold" color="$green600" mb="$4">Total: ${course?.price}</Text>

          <Text fontWeight="bold" mb="$2" color={theme.text}>Select Payment Method:</Text>

          <VStack space="md" width="100%">
            <Button 
              onPress={() => processPayment('dummy')} 
              variant="outline" 
              borderColor="$coolGray300"
            >
              <ButtonText color={theme.text}>Dummy Payment (Instant)</ButtonText>
            </Button>

            <Button 
              onPress={() => processPayment('razorpay')} 
              bg={theme.primary}
            >
              <ButtonText color="$white">Pay with Razorpay</ButtonText>
            </Button>

            <Pressable onPress={onClose} mt="$2">
              <Text color="$red500" textAlign="center" fontWeight="bold">Cancel</Text>
            </Pressable>
          </VStack>
        </Box>
      </Center>
    </Modal>
  );
}