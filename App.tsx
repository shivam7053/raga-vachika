import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HelpScreen from './src/screens/HelpScreen';
import { Platform, TouchableOpacity, View } from 'react-native';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import CreateCourseScreen from './src/screens/admin/CreateCourseScreen';
import AddLessonScreen from './src/screens/admin/AddLessonScreen';
import CourseClassroomScreen from './src/screens/CourseClassroomScreen';
import CreateTestScreen from './src/screens/admin/CreateTestScreen';
import TestScreen from './src/screens/TestScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SplashScreen from './src/screens/SplashScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import SendNotificationScreen from './src/screens/admin/SendNotificationScreen';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { GluestackUIProvider, Center, Spinner } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Ionicons } from '@expo/vector-icons';
import * as ExpoSplashScreen from 'expo-splash-screen';

const AppStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Prevent the native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync();

const AdminNavigator = () => (
  <AdminStack.Navigator>
    <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
    <AdminStack.Screen name="CreateCourse" component={CreateCourseScreen} options={{ title: 'Create Course' }} />
    <AdminStack.Screen name="AddLesson" component={AddLessonScreen} options={{ title: 'Add Lesson' }} />
    <AdminStack.Screen name="CreateTest" component={CreateTestScreen} options={{ title: 'Create Test' }} />
    <AdminStack.Screen name="SendNotification" component={SendNotificationScreen} options={{ title: 'Send Notification' }} />
  </AdminStack.Navigator>
);

const TabNavigator = () => {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Courses') iconName = focused ? 'library' : 'library-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Help') iconName = focused ? 'help-circle' : 'help-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Courses" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();
  const { toggleTheme, isDark, theme } = useTheme();
  const navigation = useNavigation<any>();
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  // Determine if the admin panel should be shown
  const showAdmin = Platform.OS === 'web' && userProfile?.role === 'admin';

  useEffect(() => {
    // Hide the native splash screen immediately so our custom video splash screen is visible
    ExpoSplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsSplashVisible(false);
      }, 2500); // Show splash for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading || isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <AppStack.Navigator>
      {user ? (
        <>
          <AppStack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ 
              title: 'Ragavachika',
              headerStyle: { backgroundColor: theme.card },
              headerTintColor: theme.text,
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                  <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ marginRight: 15 }}>
                    <Ionicons name="notifications-outline" size={24} color={theme.text} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={toggleTheme}>
                    <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
              ),
            }} 
          />
          <AppStack.Screen name="CourseClassroom" component={CourseClassroomScreen} options={{ title: 'Classroom' }} />
          <AppStack.Screen name="Test" component={TestScreen} options={{ title: 'Test' }} />
          <AppStack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
          {showAdmin && (
            <AppStack.Screen name="Admin" component={AdminNavigator} options={{ headerShown: false }} />
          )}
        </>
      ) : (
        <AppStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </AppStack.Navigator>
  );
};

const AppContent = () => {
  const { isDark } = useTheme();
  return (
    <GluestackUIProvider config={config} colorMode={isDark ? "dark" : "light"}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
