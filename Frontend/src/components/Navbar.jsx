import { AppBar, Box, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import mainIcon from '../assets/icons/main_icon.svg';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#e4e4e4',
        color: 'black',
        boxShadow: '0 2px 2px rgba(0, 0, 0, 0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        padding: '0 8px',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <img
            src={mainIcon}
            alt="Main Icon"
            style={{ width: 36, height: 36 }}
          />
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, cursor: 'pointer', textTransform: 'uppercase' }}
            onClick={() => navigate('/')}
          >
            Cympl
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
          <Button onClick={() => handleNavigate('/features')} color="inherit">Features</Button>
          <Button onClick={() => handleNavigate('/about')} color="inherit">About</Button>
          <Button onClick={() => handleNavigate('/contact')} color="inherit">Contact</Button>
          <Button
            variant="contained"
            onClick={() => handleNavigate('/lobby/test')}
            sx={{ ml: 2 }}
          >
            Launch App
          </Button>
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            aria-controls="mobile-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="mobile-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleNavigate('/features'); handleMenuClose(); }}>Features</MenuItem>
            <MenuItem onClick={() => { handleNavigate('/about'); handleMenuClose(); }}>About</MenuItem>
            <MenuItem onClick={() => { handleNavigate('/contact'); handleMenuClose(); }}>Contact</MenuItem>
            <MenuItem onClick={() => { handleNavigate('/lobby/test'); handleMenuClose(); }}>
              Launch App
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>

  );
}
