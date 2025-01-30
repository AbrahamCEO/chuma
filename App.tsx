import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';

const Tab = createBottomTabNavigator();

// Placeholder screens
const SearchScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;
const AddProductScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;
const MessagesScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;
const ProfileScreen = () => <View style={{ flex: 1, backgroundColor: '#000' }} />;

export default function App() {
  return (
    <NavigationContainer>
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
                <View style={{
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
                </View>
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
          component={AddProductScreen}
          options={{
            tabBarLabel: () => null,
            tabBarIconStyle: {
              marginTop: 20,
            },
          }}
        />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}