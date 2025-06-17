// theme.js

import { createTheme } from '@mui/material/styles';

// Expanded color system
const COLORS = {
  white: '#FFFFFF',

  // Greens
  primary: {
    100: '#E0F5EB',
    200: '#B3E3CD',
    300: '#80D0AC',
    400: '#4CBB8A',
    500: '#24B374',     // main
    600: '#1C8757',     // dark
    700: '#146642',
    800: '#0D4A30',
    900: '#062D1C',
  },

  // Accent mints
  accent: {
    100: '#F2FCF9',
    200: '#D6F9EB',
    300: '#AAEECF',     // main
    400: '#7DE4B4',
    500: '#4FD999',
    600: '#2ACF85',
  },

  // Yellow secondary (optional, feel free to adjust if unused)
  yellow: {
    100: '#FFF9E5',
    200: '#FFF2B3',
    300: '#FFEB80',
    400: '#FFE04C',
    500: '#FDD835',      // used as secondary main
    600: '#E6C200',
  },
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: COLORS.primary[500],
      light: COLORS.primary[300],
      dark: COLORS.primary[600],
      contrastText: COLORS.white,
    },
    secondary: {
      main: COLORS.yellow[500],
      light: COLORS.yellow[300],
      dark: COLORS.yellow[600],
      contrastText: COLORS.primary[900],
    },
    accent: {
      main: COLORS.accent[300],
      light: COLORS.accent[200],
      dark: COLORS.accent[400],
    },
    extended: {
      primary: COLORS.primary,
    },
    background: {
      default: COLORS.white,
      paper: COLORS.white,
      section: COLORS.accent[100], // subtle section backgrounds
    },
    text: {
      primary: COLORS.primary[700],
      secondary: COLORS.primary[500],
      disabled: COLORS.accent[300],
    },
    divider: COLORS.accent[200],
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '3rem', fontWeight: 700, color: COLORS.primary[700] },
    h2: { fontSize: '2.25rem', fontWeight: 700, color: COLORS.primary[700] },
    h3: { fontSize: '1.75rem', fontWeight: 600, color: COLORS.primary[700] },
    body1: { fontSize: '1rem', color: COLORS.primary[700] },
    body2: { fontSize: '0.9rem', color: COLORS.primary[500] },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 20px',
        },
        containedPrimary: {
          backgroundColor: COLORS.primary[500],
          '&:hover': {
            backgroundColor: COLORS.primary[600],
          },
        },
        outlinedPrimary: {
          borderColor: COLORS.primary[500],
          color: COLORS.primary[500],
          '&:hover': {
            backgroundColor: COLORS.accent[100],
            borderColor: COLORS.primary[600],
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.white,
          color: COLORS.primary[700],
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.white,
          border: `1px solid ${COLORS.accent[200]}`,
          borderRadius: '16px',
        },
      },
    },
  },
});

export default theme;


