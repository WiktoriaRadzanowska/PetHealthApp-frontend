export const COLORS = {
  // Główna zieleń (z logo i przycisków)
  primary: '#1B5E3B',
  primaryLight: '#2D8653',
  primaryDark: '#0F3D23',

  // Akcent – jasna zieleń (dot "Szczepienie")
  accentGreen: '#52B788',
  accentYellow: '#F9C74F',   // dot "Kontrola"
  accentBlue: '#4895EF',     // dot "Badanie"
  accentRed: '#F94144',      // dot "Zabieg"

  // Tło
  background: '#F7F7F5',
  white: '#FFFFFF',
  card: '#FFFFFF',

  // Tekst
  textDark: '#1C1C1E',
  textGray: '#6B6B6B',
  textLight: '#9E9E9E',

  // Alerty
  alertOrange: '#F4845F',
  danger: '#FF3B30',

  // Zakładki (dolny pasek)
  tabBar: '#1B3A2D',
  tabActive: '#FFFFFF',
  tabInactive: '#6B9080',

  // Pola formularzy
  inputBorder: '#E0E0E0',
  inputBg: '#F9F9F9',

  // Typy wizyt – odznaki
  badgeKontrola: '#E8F4FF',
  badgeSzczepienie: '#E8F8EE',
  badgeBadanie: '#FFF3E0',
  badgeZabieg: '#FFE8E8',
};

export const VISIT_TYPE_COLORS: Record<string, string> = {
  Kontrola: COLORS.accentYellow,
  Szczepienie: COLORS.accentGreen,
  Badanie: COLORS.accentBlue,
  Zabieg: COLORS.accentRed,
  Leki: COLORS.textLight,
};

export const VISIT_TYPES = ['Kontrola', 'Szczepienie', 'Badanie', 'Zabieg', 'Leki'];