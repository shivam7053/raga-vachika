import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { Box, Center, Heading, Text, VStack } from '@gluestack-ui/themed';
import { useTheme } from '../context/ThemeContext';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

export default function SplashScreen() {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const video = useRef<Video>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      // Fade in the video
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Animate text with a slight delay
      Animated.sequence([
        Animated.delay(500),
        Animated.parallel([
          Animated.timing(textAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Video is loaded and ready
      console.log('Video loaded successfully');
    } else if ('error' in status) {
      console.error('Video error:', status.error);
      setVideoError(true);
    }
  };

  return (
    <Box flex={1} bg={theme.background}>
      <Center flex={1}>
        <Animated.View style={{ opacity: fadeAnim, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <Box height={300} width="100%" alignItems="center" justifyContent="center">
            <Video
              ref={video}
              style={{ width: 300, height: 300 }}
              source={require('../../assets/logo-screen.mp4')}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={true}
              shouldPlay={true}
              isMuted={true}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              onError={(error) => {
                console.error('Video playback error:', error);
                setVideoError(true);
              }}
            />
            {videoError && (
              <Text color="$red500" mt="$2">Video failed to load</Text>
            )}
          </Box>

          <Animated.View style={{ opacity: textAnim, transform: [{ translateY: slideAnim }] }}>
            <VStack alignItems="center" space="xs" mt="$4">
              <Heading 
                size="4xl" 
                color={theme.primary} 
                fontWeight="bold" 
                fontFamily={Platform.OS === 'ios' ? 'serif' : 'serif'}
                textAlign="center"
              >
                Ragavachika
              </Heading>
              <Text 
                color={theme.text} 
                size="md" 
                letterSpacing={4} 
                fontStyle="italic"
                textAlign="center"
              >
                Empowering Knowledge
              </Text>
            </VStack>
          </Animated.View>
        </Animated.View>
      </Center>
    </Box>
  );
}