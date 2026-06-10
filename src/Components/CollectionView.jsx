import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Pagination,
  Box,
  Container,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CollectionView = ({ oggetti, tutteLeSezioni, loading }) => {
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [sezioniSelezionate, setSezioniSelezionate] = useState([]);
  const [soloConModello3D, setSoloConModello3D] = useState(false);

  const oggettiArray = useMemo(() => (Array.isArray(oggetti) ? oggetti : []), [oggetti]);
  const sezioniUniche = tutteLeSezioni || [];

  const getRepertoValue = (o, fieldName) => {
    switch (fieldName) {
      case 'sezione':
        return o.sezione || o.condizione_giuridica?.sezione || o.compilazione?.sezione;
      case 'thumbnail':
        if (!o.immagini || !Array.isArray(o.immagini) || o.immagini.length === 0) return null;
        const primaImmagine = o.immagini[0];
        const url = primaImmagine.dynamic_thumbnail_url || primaImmagine.dynamic_url;
        if (!url) return null;
        if (typeof url === "string" && url.startsWith('/')) {
          return `http://127.0.0.1:8000${url}`;
        }
        return url;
      default:
        return o[fieldName];
    }
  };

  const oggettiFiltrati = useMemo(() => {
    let risultati = oggettiArray.filter(o => getRepertoValue(o, 'thumbnail') !== null);

    if (sezioniSelezionate.length > 0) {
      risultati = risultati.filter(o => {
        const val = getRepertoValue(o, 'sezione');
        return val && sezioniSelezionate.includes(val);
      });
    }
    
    if (soloConModello3D) {
      risultati = risultati.filter(o => o.mymodel);
    }

    return [...risultati].sort((a, b) => {
      const codiceA = a.codice || "";
      const codiceB = b.codice || "";
      return codiceA.localeCompare(codiceB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [oggettiArray, sezioniSelezionate, soloConModello3D]);

  const handleCheckboxChange = (setFn) => (event) => {
    const value = event.target.name;
    const isChecked = event.target.checked;
    setFn(prev => {
      setPage(1);
      return isChecked ? [...prev, value] : prev.filter(item => item !== value);
    });
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const totalPages = Math.ceil(oggettiFiltrati.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const selectedItems = oggettiFiltrati.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Visualizzati {oggettiFiltrati.length} reperti
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ width: { xs: '100%', md: '20%' } }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: "8px" }}>
            <Accordion elevation={0} disableGutters defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><FormLabel sx={{ fontWeight: 'bold' }}>Filtri</FormLabel></AccordionSummary>
              <AccordionDetails>
                {/* Checkbox Modelli 3D Diretta */}
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={<Checkbox checked={soloConModello3D} onChange={(e) => { setSoloConModello3D(e.target.checked); setPage(1); }} />}
                    label="Solo modelli 3D"
                  />
                </Box>
                <FormGroup>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', mb: 1, display: 'block' }}>Sezioni:</Typography>
                  {sezioniUniche.map(s => (
                    <FormControlLabel key={s} control={<Checkbox checked={sezioniSelezionate.includes(s)} onChange={handleCheckboxChange(setSezioniSelezionate)} name={s} />} label={s} />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            {selectedItems.map((o) => (
              <Grid item key={o.codice || o.id} sx={{ flex: '0 0 20%', maxWidth: '20%', padding: 1 }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardActionArea component={Link} to={`/wp10/scheda/${o.codice}`}>
                    <Box sx={{ height: 160, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      <img src={getRepertoValue(o, 'thumbnail')} alt={o.codice} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} loading="lazy" />
                    </Box>
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" fontWeight="bold" noWrap>{o.codice}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 2 }}>
              <Pagination count={totalPages} page={page} onChange={handleChangePage} color="primary" size="large" />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default CollectionView;