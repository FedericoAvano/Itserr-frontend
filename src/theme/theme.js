// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800020', // Bordeaux scuro per l'AppBar
    },
    secondary: {
      main: '#eee', // Grigio molto chiaro per lo sfondo della ricerca
    },
    text: {
      primary: '#222', // Grigio scuro/quasi nero per il testo standard
      secondary: '#666', // Grigio medio per icone e placeholder
      contrast: '#fff', // ✅ Nuovo: colore di contrasto per sfondi scuri
    },
    background: {
      default: '#f4f4f4',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;