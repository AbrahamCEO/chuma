import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CreateListingScreen from './src/screens/CreateListingScreen';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens
const SearchScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;
const MessagesScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;
const AddProductScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000' },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator({ navigation }) {
  const { user } = useAuth();

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Add') {
            iconName = 'add-circle';
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateListing')}
                style={{
                  position: 'absolute',
                  top: -20,
                  width: 60,
                  height: 60,
                  backgroundColor: '#FF4785',
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 5,
                  borderColor: '#000',
                }}>
                <Ionicons name={iconName} size={30} color="#fff" />
              </TouchableOpacity>
            );
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF4785',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 10,
        },
        headerShown: false,
        tabBarShowLabel: route.name === 'Add' ? false : true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen 
        name="Add" 
        component={View}
        options={{
          tabBarLabel: () => null,
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="MainTabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="CreateListing" 
            component={CreateListingScreen}
            options={{
              headerShown: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}