import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Menu,
  MenuItem,
  ListItemIcon
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "24px",
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  display: "flex",
  alignItems: "center",
  width: "100%",
  maxWidth: "260px",
  transition: "background-color 0.2s ease",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255, 255, 255, 0.8)",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#ffffff",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: "0.9rem",
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.7)",
      opacity: 1,
    },
  },
}));

const AppBarr = ({ onSearch }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} // Azzeriamo l'ombra che a volte crea lo stacco visivo
      sx={{ 
        bgcolor: "#800020",
        top: 0,
        left: 0,
        right: 0,
        margin: 0
      }} 
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, sm: 4 } }}>
        <Box display="flex" alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 1.5 }}
            onClick={handleMenuOpen}
          >
            <MenuIcon sx={{ fontSize: "1.7rem" }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
                borderRadius: '12px',
              },
            }}
          >
            <MenuItem component={Link} to="/admin" sx={{ py: 1.5 }}>
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="medium" sx={{ color: "#800020" }} />
              </ListItemIcon>
              <Typography variant="body1" fontWeight={600} color="text.primary">
                Area Amministrazione
              </Typography>
            </MenuItem>
          </Menu>

          <Typography
            component={Link}
            to="/wp10"
            variant="h6"
            sx={{
              textDecoration: "none",
              fontWeight: 700,
              letterSpacing: "0.5px",
              color: '#ffffff',
              userSelect: "none",
              display: { xs: "none", sm: "block" },
              '&:visited, &:hover, &:active': { color: '#ffffff' },
            }}
          >
            Collezione Reperti
          </Typography>
        </Box>

        <SearchContainer>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Cerca un reperto..."
            inputProps={{ "aria-label": "search" }}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </SearchContainer>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarr;