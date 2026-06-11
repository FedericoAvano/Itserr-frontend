import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  CircularProgress,
  Container,
  Dialog,
  IconButton
} from "@mui/material";
import ThreeDRotationIcon from "@mui/icons-material/ThreeDRotation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";

const SchedaReperto = () => {
  const { codice } = useParams();
  const [dati, setDati] = useState(null);
  const [errore, setErrore] = useState(null);
  const [expanded, setExpanded] = useState({ panel1: true, panel5: true });
  
  // Stato per gestire il Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetch(`http://35.159.80.193:8000/api/reperti/${codice}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Errore nella risposta API");
        return res.json();
      })
      .then((data) => {
        setDati(data);
      })
      .catch((err) => setErrore(err.message));
  }, [codice]);

  const handleOpenImage = (url) => {
    setSelectedImage(url);
    setOpenDialog(true);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [panel]: isExpanded,
    }));
  };

  const formatValue = (value, defaultMessage = "Non specificato") => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return defaultMessage;
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : defaultMessage;
    }
    return value;
  };

  const getImageUrl = (imgObj) => {
    if (!imgObj) return null;
    let url = (
      imgObj.dynamic_url ||
      imgObj.url_large ||
      imgObj.file_immagine ||
      imgObj.dynamic_thumbnail_url ||
      imgObj.url_thumbnail ||
      imgObj.url
    );
    if (!url) return null;
    if (typeof url === "string" && url.startsWith('/')) {
      return `http://127.0.0.1:8000${url}`;
    }
    return url;
  };

  const { disegnoTecnicoUrl, fotoReali, mainImageUrl } = useMemo(() => {
    if (!dati?.immagini) return { disegnoTecnicoUrl: null, fotoReali: [], mainImageUrl: null };
    const tecnico = dati.immagini.find(img => img.didascalia && img.didascalia.includes("Disegno Tecnico"));
    const tecnicoUrl = getImageUrl(tecnico);
    const reali = dati.immagini.filter(img => !img.didascalia || !img.didascalia.includes("Disegno Tecnico"));
    const mainUrl = reali.length > 0 ? getImageUrl(reali[0]) : tecnicoUrl;
    return { disegnoTecnicoUrl: tecnicoUrl, fotoReali: reali, mainImageUrl: mainUrl };
  }, [dati]);

  const DetailItem = ({ label, value, xs = 12, sm = 6 }) => (
    <Grid item xs={xs} sm={sm}>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</Typography>
        <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 500, mt: 0.2 }}>{formatValue(value)}</Typography>
      </Box>
    </Grid>
  );

  if (errore) {
    return (
      <Container sx={{ mt: 8, textAlign: "center" }}>
        <Typography color="error" variant="h6">Errore nel caricamento del reperto: {errore}</Typography>
        <Button startIcon={<ArrowBackIcon />} component={Link} to="/wp10" sx={{ mt: 2, color: "#800020" }}>Torna alla galleria</Button>
      </Container>
    );
  }

  if (!dati) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress sx={{ color: "#800020" }} />
        <Typography color="text.secondary">Caricamento scheda tecnica...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} to="/wp10" sx={{ mb: 2, color: "#800020", textTransform: "none", fontWeight: 600 }}>
        Torna alla collezione
      </Button>

      <Card sx={{ borderRadius: "16px", boxShadow: "0px 8px 32px rgba(0,0,0,0.08)", overflow: "hidden", bgcolor: "background.paper" }}>
        {mainImageUrl ? (
          <Box
            sx={{ width: "100%", height: 420, backgroundImage: `url(${mainImageUrl})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", bgcolor: "#fafafa", borderBottom: "1px solid", borderColor: "divider", cursor: "pointer" }}
            onClick={() => handleOpenImage(mainImageUrl)}
          />
        ) : (
          <Box sx={{ width: "100%", height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="body1" color="text.secondary">Immagine principale non disponibile</Typography>
          </Box>
        )}

        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: "#2c3e50", letterSpacing: "-0.5px" }}>{dati.definizione || "Definizione non disponibile"}</Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>ID Catalogo: <Box component="span" sx={{ color: "#800020", fontWeight: 600 }}>{dati.codice}</Box></Typography>
            </Box>
            {dati.mymodel && (
              <Button component={Link} to={`/wp10/modelli/${dati.mymodel}`} variant="contained" startIcon={<ThreeDRotationIcon />} sx={{ bgcolor: "#800020", textTransform: "none", fontWeight: 600, px: 3, py: 1, borderRadius: "20px", "&:hover": { bgcolor: "#600018" } }}>Visualizza 3D</Button>
            )}
          </Box>
        </CardContent>

        <Box sx={{ p: 2, pt: 0 }}>
          <Accordion expanded={expanded.panel1} onChange={handleChange("panel1")} disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: "1px solid #eee" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#800020" }} />} sx={{ px: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>Dati Analitici</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 3 }}>
              <Grid container spacing={2}>
                <DetailItem label="Definizione" value={dati.definizione} />
                <DetailItem label="Tipologia Funzionale" value={dati.tipologia_funzionale} />
                <DetailItem label="Categoria Materiale" value={dati.categoria_materiale} />
                <DetailItem label="Materia e Tecnica" value={dati.materia_tecnica} />
                <DetailItem label="Classe di Production" value={dati.classe_produzione} />
                <DetailItem label="Cronologia" value={dati.riferimento_cronologico} />
                <DetailItem label="Stato di Conservazione" value={dati.stato_conservazione} />
                <DetailItem label="Descrizione" value={dati.descrizione} xs={12} sm={12} />
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.panel2} onChange={handleChange("panel2")} disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: "1px solid #eee" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#800020" }} />} sx={{ px: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>Misure</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 3 }}>
              <Grid container spacing={2}>
                {dati.misure_dettagliate && dati.misure_dettagliate.length > 0 ? (
                  dati.misure_dettagliate.map((misura, index) => {
                    const label = misura.tipo.charAt(0).toUpperCase() + misura.tipo.slice(1).replace(/_/g, ' ');
                    const unitaCorretta = misura.tipo === 'peso' ? 'g' : formatValue(misura.unita, '');
                    const value = `${formatValue(misura.valore)} ${unitaCorretta}`;
                    return <DetailItem label={label} value={value} key={index} />;
                  })
                ) : <Grid item xs={12}><Typography variant="body2" color="text.secondary">Nessuna misura disponibile.</Typography></Grid>}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.panel3} onChange={handleChange("panel3")} disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: "1px solid #eee" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#800020" }} />} sx={{ px: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>Localizzazione e Inventario</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: "#800020", fontWeight: 700, mb: 2 }}>Dati Geografici e Sede</Typography>
              <Grid container spacing={2}>
                <DetailItem label="Regione" value={dati.regione} />
                <DetailItem label="Provincia" value={dati.provincia} />
                <DetailItem label="Comune" value={dati.comune} />
                <DetailItem label="Museo" value={dati.denominazione_museo} />
                <DetailItem label="Indirizzo" value={dati.indirizzo} />
                <DetailItem label="Raccolta" value={dati.denominazione_raccolta} />
                <DetailItem label="Sezione" value={dati.sezione} />
                <DetailItem label="Specifiche Collocazione" value={dati.specifiche_collocazione} />
              </Grid>
              <Divider sx={{ my: 2, opacity: 0.5 }} />
              <Typography variant="subtitle2" sx={{ color: "#800020", fontWeight: 700, mb: 2 }}>Registri di Inventario</Typography>
              <Grid container spacing={2}>
                <DetailItem label="Codice Reperto (SIPOR)" value={dati.codice} />
                <DetailItem label="Nome Inventario" value={dati.nome_inventario} />
                <DetailItem label="Codice Inventario Patrimoniale" value={dati.codice_inventario_patrimoniale} />
                <DetailItem label="Data Inventario" value={dati.data_inventario} />
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.panel4} onChange={handleChange("panel4")} disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: "1px solid #eee" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#800020" }} />} sx={{ px: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>Provenienza e Storia</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 3 }}>
              <Grid container spacing={2}>
                <DetailItem label="Provenienza" value={dati.provenienza} />
                <DetailItem label="Scavi" value={dati.scavi?.length > 0 ? dati.scavi.map(s => s.denominazione || s.note).join(', ') : null} />
                <DetailItem label="Specifiche Reperimento" value={dati.specifiche_reperimento} xs={12} sm={12} />
                <DetailItem label="Notizie Storico-Critiche" value={dati.notizie_storico_critiche} xs={12} sm={12} />
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.panel5} onChange={handleChange("panel5")} disableGutters elevation={0} sx={{ "&:before": { display: "none" }, borderBottom: "1px solid #eee" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#800020" }} />} sx={{ px: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>Immagini e Documentazione</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 3 }}>
              {disegnoTecnicoUrl && (
                <Box sx={{ mb: 4, border: "1px solid #e0e0e0", borderRadius: "12px", p: 2.5, bgcolor: "#fcfcfc" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <InsertDriveFileIcon sx={{ color: "#800020" }} />
                    <Typography variant="subtitle2" sx={{ color: "#800020", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Rilievo Grafico e Disegno Tecnico</Typography>
                  </Box>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Questo rilievo è stato estratto geometricamente e digitalizzato in automatico.</Typography>
                      <Button variant="outlined" size="small" onClick={() => handleOpenImage(disegnoTecnicoUrl)} sx={{ color: "#800020", borderColor: "#800020" }}>Apri in alta risoluzione</Button>
                    </Grid>
                    <Grid item xs={12} sm={7}>
                      <Card variant="outlined" sx={{ borderRadius: "8px", overflow: "hidden", p: 1 }}>
                        <Box component="img" src={disegnoTecnicoUrl} onClick={() => handleOpenImage(disegnoTecnicoUrl)} sx={{ width: "100%", maxHeight: "220px", objectFit: "contain", cursor: "pointer" }} />
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <Typography variant="subtitle2" sx={{ color: "#800020", fontWeight: 700, mb: 1.5 }}>Galleria Fotografica</Typography>
              <Grid container spacing={2}>
                {fotoReali.map((img, index) => {
                  const url = getImageUrl(img);
                  return url ? (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Card variant="outlined" sx={{ borderRadius: "8px", overflow: "hidden", cursor: "pointer", transition: "0.2s", "&:hover": { boxShadow: 2 } }}>
                        <Box component="img" src={url} onClick={() => handleOpenImage(url)} sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                      </Card>
                    </Grid>
                  ) : null;
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded.panel6} onChange={handleChange("panel6")} disableGutters elevation={0} sx={{ "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "#800020" }} />} sx={{ px: 2 }}><Typography variant="h6" sx={{ fontWeight: 700, color: "#2c3e50" }}>Relazioni e Amministrazione</Typography></AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2 }}>
              <DetailItem label="Tipo Acquisizione" value={dati.condizione_giuridica?.tipo_acquisizione} />
              <DetailItem label="Proprietario" value={dati.condizione_giuridica?.nome} />
              <Divider sx={{ my: 1 }} />
              <DetailItem label="Compilatore" value={dati.compilazione?.nome_compilatore} />
              <DetailItem label="Data Redazione" value={dati.compilazione?.data} />
            </AccordionDetails>
          </Accordion>
        </Box>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <Box sx={{ position: 'relative', p: 1, bgcolor: 'black', display: 'flex', justifyContent: 'center' }}>
          <IconButton onClick={() => setOpenDialog(false)} sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}>
            <CloseIcon />
          </IconButton>
          <Box component="img" src={selectedImage} sx={{ width: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
        </Box>
      </Dialog>
    </Container>
  );
};

export default SchedaReperto;