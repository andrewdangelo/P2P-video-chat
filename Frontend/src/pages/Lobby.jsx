import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { useDispatch } from 'react-redux';
import { joinCall } from '../features/call/callSlice';

export default function Lobby() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [name, setName] = useState('');
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    let mediaStream;

    async function getMedia() {
        mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        }
    }

    getMedia();

    return () => {
        if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        console.log('[Lobby] Media stream stopped on unmount');
        }
    };
    }, []);


  const handleToggleVideo = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setVideoOn(videoTrack.enabled);
    }
  };

  const handleToggleAudio = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setAudioOn(audioTrack.enabled);
    }
  };

  const handleStartCall = () => {
    if (!name.trim()) return;
    const roomId = uuidv4();

    dispatch(joinCall({
      callId: roomId,
      displayName: name,
      videoOn,
      audioOn
    }));

    navigate(`/call/${roomId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        Set Up Your Call
      </Typography>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          borderRadius: '8px',
          marginTop: '1rem',
          background: '#000',
        }}
      />

      <Box mt={3}>
        <TextField
          fullWidth
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ my: 2 }}>
          <FormControlLabel
            control={<Switch checked={videoOn} onChange={handleToggleVideo} />}
            label="Camera"
          />
          <FormControlLabel
            control={<Switch checked={audioOn} onChange={handleToggleAudio} />}
            label="Microphone"
          />
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleStartCall}
          disabled={!name.trim()}
        >
          Start Call
        </Button>
      </Box>
    </Container>
  );
}
