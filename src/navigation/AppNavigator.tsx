import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PetSelectScreen from '../screens/PetSelectScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HealthBookScreen from '../screens/HealthBookScreen';
import WeightScreen from '../screens/WeightScreen';
import PetDetailScreen from '../screens/PetDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VisitDetailScreen from '../screens/VisitDetailScreen';
import AddVisitScreen from '../screens/AddVisitScreen';
import EditVisitScreen from '../screens/EditVisitScreen';
import AddPetScreen from '../screens/AddPetScreen';
import ManagePetsScreen from '../screens/ManagePetsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AccountInfoScreen from '../screens/AccountInfoScreen';
import EditPetScreen from '../screens/EditPetScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeIcon = ({ color }: { color: string }) => (
  <Icon name="home" size={24} color={color} />
);
const HistoryIcon = ({ color }: { color: string }) => (
  <Icon name="book-open-variant" size={24} color={color} />
);
const ChartIcon = ({ color }: { color: string }) => (
  <Icon name="chart-line" size={24} color={color} />
);
const SettingsIcon = ({ color }: { color: string }) => (
  <Icon name="cog" size={24} color={color} />
);

function MainTabs({ route }: any) {
  const petId = route.params?.petId;

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          borderTopWidth: 0,
          height: 65,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.tabActive,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
      }}>
      <Tab.Screen
        name="Dom"
        component={DashboardScreen}
        initialParams={{ petId }}
        options={{ tabBarIcon: HomeIcon }}
      />
      <Tab.Screen
        name="Historia"
        component={HealthBookScreen}
        initialParams={{ petId }}
        options={{ tabBarIcon: HistoryIcon }}
      />
      <Tab.Screen
        name="Wykres"
        component={WeightScreen}
        initialParams={{ petId }}
        options={{ tabBarIcon: ChartIcon }}
      />
      <Tab.Screen
        name="Ustawienia"
        component={SettingsScreen}
        options={{ tabBarIcon: SettingsIcon }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { auth, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        id="RootStack"
        screenOptions={{ headerShown: false }}>
        {!auth ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="PetSelect" component={PetSelectScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="VisitDetail" component={VisitDetailScreen} />
            <Stack.Screen name="AddVisit" component={AddVisitScreen} />
            <Stack.Screen name="EditVisit" component={EditVisitScreen} />
            <Stack.Screen name="PetDetail" component={PetDetailScreen} />
            <Stack.Screen name="AddPet" component={AddPetScreen} />
            <Stack.Screen name="ManagePets" component={ManagePetsScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
            <Stack.Screen name="EditPet" component={EditPetScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}