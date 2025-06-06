import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { leaveCall, setVideoEnabled, setAudioEnabled } from '../features/call/callSlice';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SIGNALING_SERVER_URL;

export default function VideoCall() {
  const displayName = useSelector(state => state.call.displayName);
  const callId = useSelector(state => state.call.callId);
  const videoOn = useSelector(state => state.call.videoOn);
  const audioOn = useSelector(state => state.call.audioOn);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const socketRef = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const [status, setStatus] = useState('Initializing...');
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPeerId = useRef(null);

  const restartIce = useCallback(() => {
    const pc = peerConnection.current;
    const to = currentPeerId.current;

    if (!pc || !to) {
      console.warn('[ICE] Cannot restart ICE — peer connection or peer ID missing');
      return;
    }

    console.log('[ICE] Restarting ICE...');
    pc.createOffer({ iceRestart: true })
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        console.log('[ICE] Sending ICE restart offer');
        socketRef.current.emit('offer', {
          offer: pc.localDescription,
          to
        });
      })
      .catch(err => {
        console.error('[ICE] Failed to restart ICE:', err);
      });
  }, []);

  const createPeerConnection = useCallback((otherUserId, isInitiator) => {
    if (peerConnection.current) {
      console.warn('[WebRTC] Peer connection already exists — skipping creation');
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.current = pc;

    pc.onsignalingstatechange = () => {
      console.log('[WebRTC] Signaling state changed:', pc.signalingState);
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        console.warn('[WebRTC] Disconnected or failed — attempting ICE restart');
        restartIce();
      }
    };

    localStream.current.getTracks().forEach(track => {
      pc.addTrack(track, localStream.current);
    });

    pc.ontrack = e => {
      console.log('[WebRTC] Received remote stream');
      if (!remoteStream.current) {
        remoteStream.current = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream.current;
        }
      }
      e.streams[0].getTracks().forEach(track => {
        remoteStream.current.addTrack(track);
      });
    };

    pc.onicecandidate = e => {
      if (e.candidate) {
        console.log('[ICE] Sending ICE candidate');
        socketRef.current.emit('ice-candidate', {
          candidate: e.candidate,
          to: otherUserId
        });
      }
    };

    if (isInitiator) {
      pc.createOffer()
        .then(offer => {
          console.log('[WebRTC] Created offer');
          return pc.setLocalDescription(offer);
        })
        .then(() => {
          console.log('[WebRTC] Set local description (offer)');
          socketRef.current.emit('offer', {
            offer: pc.localDescription,
            to: otherUserId
          });
        });
    }
  }, [restartIce]);

  useEffect(() => {

    if (!callId) return;

    console.log('[VideoCall] Initializing...');
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log(`[Socket.IO] Connected as ${socketRef.current.id}`);
      setStatus('Connected to signaling server');
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        console.log('[Media] Local media stream acquired');

        socketRef.current.emit('join-room', { roomId: callId });

        socketRef.current.on('other-user', (otherUserId) => {
          console.log(`[Room] Found peer: ${otherUserId}`);
          currentPeerId.current = otherUserId;
          setStatus('Creating offer...');
          createPeerConnection(otherUserId, true);
        });

        socketRef.current.on('user-joined', (userId) => {
          console.log(`[Room] User joined: ${userId}`);
          currentPeerId.current = userId;
          setStatus('Waiting for offer...');
          createPeerConnection(userId, false);
        });

        socketRef.current.on('offer', async ({ offer, from }) => {
          const pc = peerConnection.current;
          console.log('[WebRTC] Received offer from', from);
          if (pc.signalingState !== 'stable') {
            console.warn('[WebRTC] Offer ignored: signaling state is not stable');
            return;
          }

          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            console.log('[WebRTC] Set remote description (offer)');
            if (pc.signalingState !== 'have-remote-offer') return;

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('[WebRTC] Set local description (answer)');
            socketRef.current.emit('answer', { answer, to: from });
          } catch (err) {
            console.error('[WebRTC] Failed during offer-answer flow:', err);
          }
        });

        socketRef.current.on('answer', async ({ answer }) => {
          const pc = peerConnection.current;
          if (!pc || pc.signalingState !== 'have-local-offer') return;
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('[WebRTC] Set remote description (answer)');
          } catch (err) {
            console.error('[WebRTC] Failed to set remote answer:', err);
          }
        });

        socketRef.current.on('ice-candidate', ({ candidate }) => {
          console.log('[ICE] Received ICE candidate');
          peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socketRef.current.on('media-toggle', ({ type, enabled }) => {
          console.log(`[MEDIA] Peer toggled ${type}: ${enabled ? 'on' : 'off'}`);
          if (type === 'video') {
            setRemoteVideoEnabled(enabled);
          } else if (type === 'audio' && remoteStream.current) {
            const track = remoteStream.current.getAudioTracks()[0];
            if (track) track.enabled = enabled;
          }
        });
      })
      .catch(err => {
        console.error('[Media] Failed to get user media:', err);
        setStatus('Error accessing camera/mic');
      });

    return () => {
      console.log('[Cleanup] Disconnecting...');
      if (socketRef.current) socketRef.current.disconnect();
      localStream.current?.getTracks().forEach(track => track.stop());
      remoteStream.current?.getTracks().forEach(track => track.stop());
      peerConnection.current?.close();

      peerConnection.current = null;
      localStream.current = null;
      remoteStream.current = null;
      socketRef.current = null;

      console.log('[Cleanup] Resources released');
    };
  }, [callId, dispatch, createPeerConnection]);

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      dispatch(setVideoEnabled(videoTrack.enabled));
      console.log(`[Media] Camera ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      socketRef.current.emit('media-toggle', {
        type: 'video',
        enabled: videoTrack.enabled,
        to: currentPeerId.current
      });
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      dispatch(setAudioEnabled(audioTrack.enabled));
      console.log(`[Media] Mic ${audioTrack.enabled ? 'enabled' : 'disabled'}`);
      socketRef.current.emit('media-toggle', {
        type: 'audio',
        enabled: audioTrack.enabled,
        to: currentPeerId.current
      });
    }
  };

    const handleLeaveCall = () => {
    console.log('[Call] Leaving call');

    // Stop media tracks if present
    if (localStream.current) {
        localStream.current.getTracks().forEach(track => {
        console.log(`[Media] Stopping local ${track.kind} track`);
        track.stop();
        });
    }

    if (remoteStream.current) {
        remoteStream.current.getTracks().forEach(track => {
        console.log(`[Media] Stopping remote ${track.kind} track`);
        track.stop();
        });
    }

    // Close peer connection and socket
    peerConnection.current?.close();
    socketRef.current?.disconnect();

    // Clear refs
    peerConnection.current = null;
    localStream.current = null;
    remoteStream.current = null;
    socketRef.current = null;

    dispatch(leaveCall());

    navigate('/');
    };


  return (
    <Container maxWidth="lg">
      <Box textAlign="center" mt={4}>
        <Typography variant="h5" gutterBottom>
          Room: {callId}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {displayName ? `You are: ${displayName}` : ''}
        </Typography>
        <Typography sx={{ mt: 1 }} color="text.secondary">
          {status}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button variant="outlined" onClick={restartIce}>
            Restart ICE
          </Button>
          <Button variant={videoOn ? 'contained' : 'outlined'} onClick={toggleVideo}>
            {videoOn ? 'Turn Off Camera' : 'Turn On Camera'}
          </Button>
          <Button variant={audioOn ? 'contained' : 'outlined'} onClick={toggleAudio}>
            {audioOn ? 'Mute Mic' : 'Unmute Mic'}
          </Button>
          <Button variant="contained" color="error" onClick={handleLeaveCall}>
            Leave Call
          </Button>
        </Stack>
      </Box>

      <Box display="flex" justifyContent="center" mt={4} gap={4} flexWrap="wrap">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          width="300"
          style={{ borderRadius: 8, background: '#000' }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          width="300"
          style={{ borderRadius: 8, background: '#000', display: remoteVideoEnabled ? 'block' : 'none' }}
        />
      </Box>
    </Container>
  );
}
