// src/pages/Lobby.jsx
import { useState } from 'react';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Lobby() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    const callId = uuidv4();
    navigate(`/call/${callId}`, { state: { displayName: name } });
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} textAlign="center">
        <Typography variant="h5" gutterBottom>
          Enter your name to join a call
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          variant="contained"
          color="success"
          onClick={handleJoin}
          disabled={!name.trim()}
        >
          Join Call
        </Button>
      </Box>
    </Container>
  );
}
