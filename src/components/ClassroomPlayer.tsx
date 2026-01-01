import React, { useState, useEffect, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Box, VStack, HStack, Text, Input, InputField, Button, ButtonText, 
  Heading, Avatar, AvatarFallbackText, Card, Divider 
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';

interface ClassroomPlayerProps {
  courseId: string;
  lessonId: string;
  videoId: string;
  title: string;
}

export default function ClassroomPlayer({ courseId, lessonId, videoId, title }: ClassroomPlayerProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const { user, userProfile } = useAuth();
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    if (!courseId || !lessonId) return;

    const q = query(
      collection(db, 'courses', courseId, 'lessons', lessonId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      // Scroll to bottom on new message
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => unsubscribe();
  }, [courseId, lessonId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    try {
      await addDoc(collection(db, 'courses', courseId, 'lessons', lessonId, 'messages'), {
        text: inputText,
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp(),
      });
      setInputText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.userId === user?.uid;
    return (
      <HStack mb="$3" justifyContent={isMe ? 'flex-end' : 'flex-start'} alignItems="flex-end" space="sm">
        {!isMe && (
          <Avatar size="xs" bgColor="$coolGray400">
            <AvatarFallbackText>{item.userEmail}</AvatarFallbackText>
          </Avatar>
        )}
        <Box 
          bg={isMe ? theme.primary : theme.card} 
          p="$3" 
          borderRadius="$xl" 
          borderBottomRightRadius={isMe ? 0 : '$xl'}
          borderBottomLeftRadius={!isMe ? 0 : '$xl'}
          maxWidth="80%"
        >
          {!isMe && <Text size="xs" color="$coolGray500" mb="$1">{item.userEmail?.split('@')[0]}</Text>}
          <Text color={isMe ? '$white' : theme.text}>{item.text}</Text>
        </Box>
      </HStack>
    );
  };

  // Calculate optimal height for 16:9 aspect ratio based on screen width
  const screenWidth = Dimensions.get('window').width;
  // Subtract padding (approx 32px for p="$4" on both sides) if not in theater mode
  const availableWidth = isTheaterMode ? screenWidth : screenWidth - 32; 
  const videoHeight = isTheaterMode ? availableWidth * (9 / 16) : 220;

  return (
    <VStack space="md" mb="$6">
      {/* Video Player Section */}
      <Box 
        borderRadius={isTheaterMode ? 0 : "$lg"} 
        overflow="hidden" 
        bg="$black" 
        mx={isTheaterMode ? -16 : 0} // Negative margin to stretch full width in theater mode
      >
        <YoutubePlayer
          height={videoHeight}
          play={false}
          videoId={videoId}
          webViewProps={{
            scrollEnabled: false, // Disable scrolling inside the webview
          }}
        />
      </Box>
      
      <HStack justifyContent="space-between" alignItems="center" mt="$2">
        <Heading size="md" color={theme.text} flex={1}>{title}</Heading>
        <Button size="xs" variant="outline" onPress={() => setIsTheaterMode(!isTheaterMode)} borderColor={theme.primary}>
          <ButtonText color={theme.primary}>{isTheaterMode ? "Default View" : "Theater Mode"}</ButtonText>
        </Button>
      </HStack>

      {/* Discussion / Chat Section */}
      <Card p="$0" overflow="hidden" borderColor={theme.border} borderWidth={1} borderRadius="$lg" bg={theme.background}>
        <Box p="$3" bg={theme.card} borderBottomWidth={1} borderColor={theme.border}>
          <Heading size="sm" color={theme.text}>Class Discussion</Heading>
        </Box>
        
        <Box height={300} bg={theme.background}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 15 }}
          />
        </Box>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <HStack p="$3" bg={theme.card} alignItems="center" space="sm" borderTopWidth={1} borderColor={theme.border}>
            <Input variant="outline" size="sm" flex={1} borderRadius="$full" borderColor={theme.border} bg={theme.inputBackground}>
              <InputField 
                placeholder="Ask a question..." 
                value={inputText} 
                onChangeText={setInputText} 
                color={theme.text}
                placeholderTextColor={theme.placeholder}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
            </Input>
            <Button 
              size="sm" 
              borderRadius="$full" 
              w="$10" h="$10" 
              p="$0" 
              bgColor={theme.primary} 
              onPress={sendMessage}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="send" size={20} color="white" />
            </Button>
          </HStack>
        </KeyboardAvoidingView>
      </Card>
    </VStack>
  );
}