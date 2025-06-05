// src/pages/VideoCall.jsx
import { useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

export default function VideoCall() {
  const { callId } = useParams();
  const { state } = useLocation();

  return (
    <Container maxWidth="md">
      <Box mt={8} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Room: {callId}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          You are: {state?.displayName || 'Anonymous'}
        </Typography>
        {/* Add video chat UI here */}
      </Box>
    </Container>
  );
}
