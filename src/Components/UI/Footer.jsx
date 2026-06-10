import React from 'react';
import { Box, Typography, Link, Container, Grid, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#800020', // Bordeaux coerente con il resto della UI
        color: 'rgba(255, 255, 255, 0.9)', // Bianco morbido meno stancante
        pt: 4,
        pb: 3,
        mt: 'auto', // Spinge il footer in basso se la pagina è corta
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center" justifyContent="space-between">
          
          {/* COLONNA SINISTRA: Progetto / Info */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ fontWeight: 700, letterSpacing: '0.5px', color: '#ffffff' }}
              >
                ITSERR Project
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: '350px', mx: { xs: 'auto', sm: 0 } }}>
                Piattaforma per la gestione, digitalizzazione e visualizzazione interattiva dei reperti del Museo Scerrato.
              </Typography>
            </Box>
          </Grid>

          {/* COLONNA DESTRA: Link di Navigazione */}
          <Grid item xs={12} sm={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: { xs: 'center', sm: 'flex-end' },
                flexWrap: 'wrap'
              }}
            >
              <Link 
                component={RouterLink} 
                to="/wp10" 
                color="inherit" 
                underline="hover" 
                sx={{ fontSize: '0.9rem', fontWeight: 500, '&:hover': { color: '#ffffff' } }}
              >
                Galleria
              </Link>
              <Link 
                component={RouterLink} 
                to="/about" 
                color="inherit" 
                underline="hover" 
                sx={{ fontSize: '0.9rem', fontWeight: 500, '&:hover': { color: '#ffffff' } }}
              >
                Chi Siamo
              </Link>
              <Link 
                component={RouterLink} 
                to="/contact" 
                color="inherit" 
                underline="hover" 
                sx={{ fontSize: '0.9rem', fontWeight: 500, '&:hover': { color: '#ffffff' } }}
              >
                Contatti
              </Link>
            </Box>
          </Grid>

        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Copyright in fondo */}
        <Box textAlign="center">
          <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} ITSERR. Tutti i diritti riservati.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;