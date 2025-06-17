import { AppBar, Box, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Container, Stack } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch } from 'react-redux';

import { joinCall } from '../features/call/callSlice';
import { useSelector } from 'react-redux';


import mainIcon from '../assets/icons/main_icon.svg';
import { generateShortRoomId } from '../utils/generateRandomId';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const handleStartCall = () => {
    const roomId = generateShortRoomId();
    // Ensure roomId is unique and valid
    if (!roomId) {
      console.error('Failed to generate a valid room ID');
      return;
    }
    dispatch(joinCall({ callId: roomId, displayName: '', videoOn: true, audioOn: true }));
    navigate(`/lobby/${roomId}`);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'background.default',
        py: 2,
        boxShadow: (theme) => `0 6px 10px 0 ${theme.palette.background.default[200]}`,
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <img src={mainIcon} alt="App Logo" style={{ height: 40 }} />

        <Stack direction="row" spacing={4} alignItems="center">
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'primary.main',
              color: '#fff',
              borderBottom: '3px solid',
              borderColor: 'secondary.main',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
            onClick={handleStartCall}
          >
            Create Room
          </Button>
          {/* <Button variant="text" color="primary">
            Contact Us
          </Button> */}
        </Stack>
      </Container>
    </AppBar>
  );
}
