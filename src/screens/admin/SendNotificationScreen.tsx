import React, { useState } from 'react';
import { Alert } from 'react-native';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useTheme } from '../../context/ThemeContext';
import { 
  Box, VStack, Heading, Text, Input, InputField, Button, ButtonText, 
  Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, 
  SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem, 
  ChevronDownIcon, Textarea, TextareaInput 
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

export default function SendNotificationScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [target, setTarget] = useState('all');
  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleSend = async () => {
    if (!title || !message) {
      Alert.alert("Error", "Please fill in title and message");
      return;
    }

    setLoading(true);
    try {
      let userId = null;

      if (target === 'user') {
        if (!targetEmail) {
          Alert.alert("Error", "Please enter user email");
          setLoading(false);
          return;
        }
        // Find user by email
        const q = query(collection(db, 'users'), where('email', '==', targetEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          Alert.alert("Error", "User not found");
          setLoading(false);
          return;
        }
        userId = querySnapshot.docs[0].id;
      }

      await addDoc(collection(db, 'notifications'), {
        title,
        message,
        type,
        target,
        userId,
        timestamp: serverTimestamp()
      });

      Alert.alert("Success", "Notification sent!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} bg={theme.background} p="$5">
      <Heading size="xl" color={theme.text} mb="$5">Send Notification</Heading>
      
      <VStack space="md">
        <Text color={theme.text} fontWeight="bold">Title</Text>
        <Input variant="outline" size="md" borderColor={theme.border}>
          <InputField placeholder="Notification Title" value={title} onChangeText={setTitle} color={theme.text} />
        </Input>

        <Text color={theme.text} fontWeight="bold">Message</Text>
        <Textarea size="md" borderColor={theme.border}>
          <TextareaInput placeholder="Notification Message" value={message} onChangeText={setMessage} color={theme.text} />
        </Textarea>

        <Text color={theme.text} fontWeight="bold">Type</Text>
        <Select selectedValue={type} onValueChange={setType}>
          <SelectTrigger variant="outline" size="md" borderColor={theme.border}>
            <SelectInput placeholder="Select Type" color={theme.text} />
            <SelectIcon as={ChevronDownIcon} mr="$3" color={theme.text} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
              <SelectItem label="Info" value="info" />
              <SelectItem label="Warning" value="warning" />
              <SelectItem label="Success" value="success" />
            </SelectContent>
          </SelectPortal>
        </Select>

        <Text color={theme.text} fontWeight="bold">Target Audience</Text>
        <Select selectedValue={target} onValueChange={setTarget}>
          <SelectTrigger variant="outline" size="md" borderColor={theme.border}>
            <SelectInput placeholder="Select Target" color={theme.text} />
            <SelectIcon as={ChevronDownIcon} mr="$3" color={theme.text} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
              <SelectItem label="All Users" value="all" />
              <SelectItem label="Specific User" value="user" />
            </SelectContent>
          </SelectPortal>
        </Select>

        {target === 'user' && (
          <>
            <Text color={theme.text} fontWeight="bold">User Email</Text>
            <Input variant="outline" size="md" borderColor={theme.border}>
              <InputField placeholder="Enter user email" value={targetEmail} onChangeText={setTargetEmail} color={theme.text} autoCapitalize="none" />
            </Input>
          </>
        )}

        <Button 
          onPress={handleSend} 
          bgColor={theme.primary} 
          isDisabled={loading} 
          mt="$4"
        >
          <ButtonText>{loading ? "Sending..." : "Send Notification"}</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}