import React from "react";
import { useNavigate } from "react-router-dom";
// ✅ MUI COMPONENTS
import { 
  Container, Typography, Grid, Card, CardContent, 
  CardActions, Button, Box, Stack, Divider 
} from "@mui/material";
// ✅ MUI ICONS
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GridViewIcon from "@mui/icons-material/GridView"; 
import CollectionsIcon from "@mui/icons-material/Collections"; // Icona ottimizzata per il set di immagini (singole/bulk)
import LogoutIcon from "@mui/icons-material/Logout";

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("wp10/login");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      
      {/* =========================================
          1. HEADER ELEGANTE CON AZIONI
          ========================================= */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 5, 
        pb: 2, 
        borderBottom: "1px solid", 
        borderColor: "divider" 
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Logo/Icona Admin stilizzata */}
          <Box sx={{ 
            bgcolor: "#f4f0f0", 
            p: 1.5, 
            borderRadius: "12px", 
            display: "flex"
          }}>
            <GridViewIcon sx={{ color: "#800020", fontSize: 28 }} />
          </Box>
          <Typography variant="h4" component="h1" sx={{ color: "#333", fontWeight: 700, letterSpacing: "-0.5px" }}>
            Admin Dashboard
          </Typography>
        </Stack>

        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />} 
          onClick={handleLogout}
          sx={{ borderRadius: "8px", textTransform: "none" }}
        >
          Chiudi Sessione
        </Button>
      </Box>

      {/* Testo di introduzione centrale */}
      <Box textAlign="center" mb={6} px={4}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: "800px", mx: "auto" }}>
          Benvenuto nel pannello di gestione del Museo Scerrato. Seleziona una delle procedure guidate o di caricamento massivo per aggiornare i modelli 3D e il corredo fotografico dei reperti in catalogo.
        </Typography>
      </Box>

      {/* =========================================
          2. GRIGLIA OPZIONI (CARDS) - 3 COLONNE (md={4})
          ========================================= */}
      <Grid container spacing={4} justifyContent="center">
        
        {/* OPZIONE A: Caricamento Singolo Modello */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={2} 
            sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              borderRadius: "16px", 
              border: "1px solid",
              borderColor: "divider",
              transition: "transform 0.2s, box-shadow 0.2s", 
              "&:hover": { 
                boxShadow: 8,
                transform: "translateY(-4px)" 
              }
            }}>
            
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                <Box sx={{ 
                  bgcolor: "#fdf2f2", 
                  color: "#800020", 
                  p: 1.5, 
                  borderRadius: "50%", 
                  display: "flex"
                }}>
                  <CloudUploadIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Setup Singolo 3D
                </Typography>
              </Stack>
              
              <Divider sx={{ mb: 2.5 }} />

              <Typography variant="body2" color="text.secondary" sx={{ minHeight: "80px", mb: 1, lineHeight: 1.6 }}>
                Procedura singola per singolo reperto. Permette di caricare puntualmente il modello OBJ, il file dei materiali (MTL) e le relative texture associate.
              </Typography>
            </CardContent>
            
            <CardActions sx={{ p: 3, pt: 0, justifyContent: "flex-end" }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: "#800020", 
                  color: "white", 
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { bgcolor: "#600018" } 
                }}
                onClick={() => navigate("/admin/upload-3d")}
              >
                Inizia Setup
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* OPZIONE B: Caricamento Massivo Modelli 3D */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={2} 
            sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": { 
                boxShadow: 8,
                transform: "translateY(-4px)"
              }
            }}>
            
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                <Box sx={{ 
                  bgcolor: "#fdf2f2", 
                  color: "#800020", 
                  p: 1.5, 
                  borderRadius: "50%", 
                  display: "flex"
                }}>
                  <GridViewIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Bulk 3D Import
                </Typography>
              </Stack>
              
              <Divider sx={{ mb: 2.5 }} />

              <Typography variant="body2" color="text.secondary" sx={{ minHeight: "80px", mb: 1, lineHeight: 1.6 }}>
                Ideale per inserimenti multipli strutturati. Carica un file .ZIP contenente le cartelle rinominate con il codice dei reperti contenenti i file mesh.
              </Typography>
            </CardContent>
            
            <CardActions sx={{ p: 3, pt: 0, justifyContent: "flex-end" }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: "#800020", 
                  color: "white", 
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { bgcolor: "#600018" } 
                }}
                onClick={() => navigate("/bulk-upload")}
              >
                Inizia Import
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* OPZIONE C: Gestione Immagini Reperti (Unificata Singolo / Bulk) */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={2} 
            sx={{ 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "divider",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": { 
                boxShadow: 8,
                transform: "translateY(-4px)"
              }
            }}>
            
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                <Box sx={{ 
                  bgcolor: "#fdf2f2", 
                  color: "#800020", 
                  p: 1.5, 
                  borderRadius: "50%", 
                  display: "flex"
                }}>
                  <CollectionsIcon fontSize="large" />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Gestione Immagini
                </Typography>
              </Stack>
              
              <Divider sx={{ mb: 2.5 }} />

              <Typography variant="body2" color="text.secondary" sx={{ minHeight: "80px", mb: 1, lineHeight: 1.6 }}>
                Associazione foto singole o massive al catalogo. Riconosce automaticamente il codice del reperto dai nomi dei file (es: MO1138.jpg).
              </Typography>
            </CardContent>
            
            <CardActions sx={{ p: 3, pt: 0, justifyContent: "flex-end" }}>
              <Button 
                variant="contained" 
                size="large"
                sx={{ 
                  bgcolor: "#800020", 
                  color: "white", 
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 3,
                  "&:hover": { bgcolor: "#600018" } 
                }}
                onClick={() => navigate("/bulk-images-upload")} 
              >
                Apri Uploader
              </Button>
            </CardActions>
          </Card>
        </Grid>

      </Grid>
    </Container>
  );
};

export default Admin;