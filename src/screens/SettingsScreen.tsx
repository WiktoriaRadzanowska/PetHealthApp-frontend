import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserProfile, updateNotifications, deleteAccount } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

interface MenuItem {
  icon: string;
  label: string;
  sub?: string;
  screen?: string;
  danger?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen({ navigation }: any) {
  const { auth, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  useEffect(() => {
    if (!auth) return;
    getUserProfile(auth.userId).then(({ data }) => {
      setUser(data);
      setPushEnabled(data.notificationsEnabled);
      setEmailEnabled(data.emailRemindersEnabled);
    });
  }, [auth]);

  const togglePush = async (val: boolean) => {
    if (!auth) return;
    setPushEnabled(val);
    await updateNotifications(auth.userId, val, emailEnabled);
  };

  const toggleEmail = async (val: boolean) => {
    if (!auth) return;
    setEmailEnabled(val);
    await updateNotifications(auth.userId, pushEnabled, val);
  };

  const handleDeleteAccount = () => {
    if (!auth) return;
    Alert.alert(
      'Usuń konto',
      'Ta operacja jest nieodwracalna. Czy na pewno chcesz usunąć konto?',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń', style: 'destructive',
          onPress: async () => {
            await deleteAccount(auth.userId);
            await logout();
          },
        },
      ]
    );
  };

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '..';

  const menuItems: MenuItem[] = [
    {
      icon: 'lock-reset', label: 'Zmień hasło',
      sub: 'Zaktualizuj swoje hasło', screen: 'ChangePassword',
    },
    {
      icon: 'dog', label: 'Zarządzaj zwierzętami',
      sub: 'Profile zwierząt', screen: 'ManagePets',
    },
    {
      icon: 'account-outline', label: 'Dane konta',
      sub: 'Zarządzaj swoimi informacjami', screen: 'AccountInfo',
    },
    {
      icon: 'delete-outline', label: 'Usuń konto i dane',
      sub: 'Operacja nieodwracalna',
      danger: true,
      onPress: handleDeleteAccount,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>POWIADOMIENIA</Text>
        <View style={styles.switchRow}>
          <View style={styles.switchIconOrange}>
            <Icon name="bell-outline" size={20} color={COLORS.alertOrange} />
          </View>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Powiadomienia push</Text>
            <Text style={styles.switchSub}>Alerty o wizytach i przypomnieniach</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={togglePush}
            trackColor={{ true: COLORS.primary }}
          />
        </View>
        <View style={styles.switchRow}>
          <View style={styles.switchIconBlue}>
            <Icon name="email-outline" size={20} color={COLORS.accentBlue} />
          </View>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Przypomnienia e-mail</Text>
            <Text style={styles.switchSub}>Tygodniowe podsumowanie</Text>
          </View>
          <Switch
            value={emailEnabled}
            onValueChange={toggleEmail}
            trackColor={{ true: COLORS.primary }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>KONTO</Text>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}
            onPress={item.onPress ?? (() => navigation.navigate(item.screen!))}>
            <View style={[
              styles.menuIcon,
              { backgroundColor: item.danger ? COLORS.danger + '15' : COLORS.primary + '15' },
            ]}>
              <Icon
                name={item.icon} size={18}
                color={item.danger ? COLORS.danger : COLORS.primary}
              />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                {item.label}
              </Text>
              {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
            </View>
            {!item.danger && (
              <Icon name="chevron-right" size={18} color={COLORS.textLight} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 64, paddingBottom: 24,
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  avatarText: { fontSize: 26, fontWeight: '700', color: COLORS.white },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16, elevation: 1,
  },
  sectionTitle: {
    fontSize: 10, fontWeight: '700', color: COLORS.textGray,
    letterSpacing: 1, marginBottom: 12,
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  switchIconOrange: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.alertOrange + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  switchIconBlue: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.accentBlue + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  switchText: { flex: 1 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  switchSub: { fontSize: 11, color: COLORS.textGray, marginTop: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.inputBorder },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  menuLabelDanger: { color: COLORS.danger },
  menuSub: { fontSize: 11, color: COLORS.textGray, marginTop: 1 },
  logoutBtn: {
    margin: 16, padding: 16, backgroundColor: COLORS.white,
    borderRadius: 16, alignItems: 'center', elevation: 1,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.danger },
});