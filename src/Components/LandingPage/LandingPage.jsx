import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Box, Grid, Paper } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// =========================================================================
// COMPONENTE LANDING PAGE ISTITUZIONALE
// =========================================================================
const LandingPage = () => {
  return (
    // Box contenitore principale che garantisce lo sfondo fluido e l'azzeramento di bordi bianchi orrendi
    <Box 
      sx={{ 
        minHeight: '100vh', 
        width: '100vw', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: '#f4f4f4', // Grigio leggerissimo di fondo, coerente con CssBaseline
        margin: 0,
        padding: 0,
        overflowX: 'hidden' // Impedisce scorrimenti orizzontali accidentali
      }}
    >
      {/* Contenitore a Griglia flessibile, blindato a 100vh di altezza su PC */}
      <Grid 
        container 
        sx={{ 
          flexGrow: 1, 
          minHeight: '100vh', // Prende l'intera altezza della finestra
          width: '100%',
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'stretch' }, // Su PC si stirano, su mobile sono fluidi
          justifyContent: 'center',
          m: 0, 
          p: 0,
          border: 'none',
          boxShadow: 'none'
        }}
      >
        
        {/* SEZIONE WORK PROJECT 9 (SIDEBAR/MODULO 1) */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: { xs: 4, sm: 6, md: 8 }, // Padding responsive bilanciato
            borderRight: { md: '1px solid #e0e0e0' }, // Separatore verticale minimale su PC
            borderBottom: { xs: '1px solid #e0e0e0', md: 'none' }, // Separatore orizzontale minimale su Mobile
            background: 'linear-gradient(135deg, #ffffff 0%, #fdfdfd 100%)' // Sfondo quasi bianco editoriale
          }}
        >
          {/* Card speculare blindata all'estetica istituzionale (coerente con CollectionView) */}
          <Paper 
            elevation={1} // Ombra morbida iniziale
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              width: '100%',
              maxWidth: '450px',
              textAlign: 'center',
              borderRadius: "8px", // Stesso raggio delle Card nella CollectionView
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)", // Effetto sollevamento millimetrico al passaggio mouse
                boxShadow: 4, // Ombra più profonda che simula lo stacco dal fondo
              }
            }}
          >
            <Box>
              {/* TITOLO ISTITUZIONALE */}
              <Typography
                variant="h3"
                component="h1"
                fontWeight={700}
                gutterBottom
                sx={{ 
                  color: '#800020', // Bordeaux istituzionale d'ordinanza
                  fontSize: { xs: '2rem', sm: '2.8rem' }, // Dimensione proporzionale responsive
                  letterSpacing: '-0.5px'
                }}
              >
                Esplora il WP 9
              </Typography>
              
              {/* DESCRIZIONE TECNICA/ACADEMICA */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 400, 
                  lineHeight: 1.7, // Interlinea ariosa editoriale
                  fontSize: { xs: '0.9rem', sm: '1.05rem' } 
                }}
              >
                La vetrina digitale del Work Project 9 del progetto ITSERR. Accedi alla consultazione e alla gestione della prima sezione dei reperti archeologici.
              </Typography>
            </Box>

            {/* PULSANTE CTA ISTITUZIONALE (SQUADRATO E BORDEAUX) */}
            <Button
              component={Link}
              to="/wp9"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{ 
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none', // Impedisce il tutto maiuscolo aggressivo
                borderRadius: '4px', // Taglio squadrato coerente con Scheda Reperto
                bgcolor: '#800020',
                transition: "background-color 0.15s ease",
                '&:hover': {
                  bgcolor: '#600018',
                }
              }}
            >
              Vedi tutti i reperti
            </Button>
          </Paper>
        </Grid>

        {/* SEZIONE WORK PROJECT 10 (SIDEBAR/MODULO 2) */}
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: { xs: 4, sm: 6, md: 8 },
            background: 'linear-gradient(135deg, #fafafa 0%, #f6f6f6 100%)' // Sfondo leggermente più grigio per staccare visivamente
          }}
        >
          {/* Card speculare blindata all'estetica istituzionale (coerente con CollectionView) */}
          <Paper 
            elevation={1} // Ombra morbida iniziale
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              width: '100%',
              maxWidth: '450px',
              textAlign: 'center',
              borderRadius: "8px", // Stesso raggio delle Card nella CollectionView
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-4px)", // Effetto sollevamento millimetrico al passaggio mouse
                boxShadow: 4, // Ombra più profonda che simula lo stacco dal fondo
              }
            }}
          >
            <Box>
              {/* TITOLO ISTITUZIONALE (STESSO COLORE DEL WP9 PER UNIFORMITÀ DI PROGETTO) */}
              <Typography
                variant="h3"
                component="h2"
                fontWeight={700}
                gutterBottom
                sx={{ 
                  color: '#800020', // Bordeaux istituzionale coerente
                  fontSize: { xs: '2rem', sm: '2.8rem' },
                  letterSpacing: '-0.5px'
                }}
              >
                Esplora il WP 10
              </Typography>
              
              {/* DESCRIZIONE TECNICA/ACADEMICA */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  fontWeight: 400, 
                  lineHeight: 1.7, // Interlinea ariosa editoriale
                  fontSize: { xs: '0.9rem', sm: '1.05rem' } 
                }}
              >
                La vetrina digitale del Work Project 10 del progetto ITSERR. Naviga all'interno della galleria completa e visualizza i modelli 3D dei reperti archeologici.
              </Typography>
            </Box>

            {/* PULSANTE CTA ISTITUZIONALE (SQUADRATO E BORDEAUX) */}
            <Button
              component={Link}
              to="/wp10"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon fontSize="small" />}
              sx={{ 
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none', // Impedisce il tutto maiuscolo aggressivo
                borderRadius: '4px', // Taglio squadrato coerente con Scheda Reperto
                bgcolor: '#800020',
                transition: "background-color 0.15s ease",
                '&:hover': {
                  bgcolor: '#600018',
                }
              }}
            >
              Vedi tutti i reperti
            </Button>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default LandingPage;