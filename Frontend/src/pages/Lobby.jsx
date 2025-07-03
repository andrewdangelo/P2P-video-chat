import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { useDispatch, useSelector } from "react-redux";
import {
  joinCall,
  setAudioEnabled,
  setVideoEnabled,
} from "../features/call/callSlice";

import VideoBox from "../components/VideoBox";

export default function Lobby() {
  const [stream, setStream] = useState(null);
  const [localName, setLocalName] = useState("");
  const videoOn = useSelector((state) => state.call.videoOn);
  const audioOn = useSelector((state) => state.call.audioOn);

  const { callId: routeCallId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { displayName, callId: reduxCallId } = useSelector(
    (state) => state.call
  );

  const resolvedCallId = reduxCallId || routeCallId || uuidv4();

  useEffect(() => {
    let mediaStream;

    async function getMedia() {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
    }

    getMedia();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        console.log("[Lobby] Stopped local media tracks on unmount");
      }
    };
  }, [dispatch]);

  const handleToggleVideo = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      const newState = !videoTrack.enabled;
      videoTrack.enabled = newState;
      dispatch(setVideoEnabled(newState));
    }
  };

  const handleToggleAudio = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      dispatch(setAudioEnabled(newState));
    }
  };

  const handleStartCall = () => {
    const nameToUse = displayName || localName;
    if (!nameToUse.trim()) return;

    dispatch(
      joinCall({
        callId: resolvedCallId,
        displayName: nameToUse,
        videoOn,
        audioOn,
      })
    );

    navigate(`/call/${resolvedCallId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        Set Up Your Call
      </Typography>

      <Box mt={2}>
        <VideoBox
          stream={stream}
          videoEnabled={videoOn}
          audioEnabled={audioOn}
          label={localName || ""}
          muted={true}
          videoWidth="100%"
          videoHeight="auto"
        />
      </Box>

      <Box mt={3}>
        <TextField
          fullWidth
          label="Your Name"
          value={displayName || localName}
          onChange={(e) => setLocalName(e.target.value)}
          margin="normal"
        />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ my: 2 }}
        >
          <FormControlLabel
            control={
              <Switch checked={videoOn} onChange={handleToggleVideo} />
            }
            label="Camera"
          />
          <FormControlLabel
            control={
              <Switch checked={audioOn} onChange={handleToggleAudio} />
            }
            label="Microphone"
          />
        </Stack>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handleStartCall}
          disabled={!displayName.trim() && !localName.trim()}
        >
          Start Call
        </Button>
      </Box>
    </Container>
  );
}
