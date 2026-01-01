import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Box, Heading, Text, Card, VStack, Icon, BellIcon, InfoIcon, AlertCircleIcon, CheckCircleIcon, HStack } from '@gluestack-ui/themed';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter for 'all' or specific user
        if (data.target === 'all' || data.userId === user.uid) {
          notifs.push({ id: doc.id, ...data });
        }
      });
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Icon as={AlertCircleIcon} color="$amber500" size="md" />;
      case 'success': return <Icon as={CheckCircleIcon} color="$green500" size="md" />;
      default: return <Icon as={InfoIcon} color="$blue500" size="md" />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card p="$4" mb="$3" backgroundColor={theme.card} borderColor={theme.border} borderWidth={1}>
      <HStack space="md" alignItems="flex-start">
        <Box mt="$1">
          {getIcon(item.type)}
        </Box>
        <VStack flex={1}>
          <Heading size="sm" color={theme.text} mb="$1">{item.title}</Heading>
          <Text size="sm" color={theme.text}>{item.message}</Text>
          <Text size="xs" color="$coolGray500" mt="$2">
            {item.timestamp?.toDate().toLocaleString()}
          </Text>
        </VStack>
      </HStack>
    </Card>
  );

  return (
    <Box flex={1} bg={theme.background} p="$4">
      <Heading size="xl" color={theme.text} mb="$4">Notifications</Heading>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Box alignItems="center" mt="$10">
            <Icon as={BellIcon} size="xl" color="$coolGray400" mb="$4" />
            <Text color="$coolGray500">No notifications yet</Text>
          </Box>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Box>
  );
}