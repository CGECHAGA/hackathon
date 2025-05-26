import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
  },
  // 8px spacing system
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  // Common border radius values
  borderRadius: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    circle: 9999,
  },
  // Common sizes
  sizes: {
    iconSmall: 16,
    iconMedium: 24,
    iconLarge: 32,
    buttonHeight: 48,
    inputHeight: 48,
    cardSmall: 80,
    cardMedium: 120,
    cardLarge: 160,
  },
  // Common shadows
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  // Responsive breakpoints
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 768,
  isLargeDevice: width >= 768,
};