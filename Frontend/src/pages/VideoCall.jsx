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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({});
  const [remotePeers, setRemotePeers] = useState({}); // { peerId: { stream, videoEnabled } }
  const [status, setStatus] = useState('Initializing...');

  const restartIce = useCallback(() => {
    Object.entries(peerConnections.current).forEach(([id, pc]) => {
      pc.createOffer({ iceRestart: true })
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit('offer', { offer: pc.localDescription, to: id });
        })
        .catch(err => console.error('[ICE] Failed to restart ICE for', id, err));
    });
  }, []);

  const createPeerConnection = useCallback((peerId, isInitiator) => {
    if (peerConnections.current[peerId]) return peerConnections.current[peerId];

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnections.current[peerId] = pc;

    localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));

    pc.onicecandidate = e => {
      if (e.candidate) {
        socketRef.current.emit('ice-candidate', { candidate: e.candidate, to: peerId });
      }
    };

    pc.ontrack = e => {
      setRemotePeers(prev => {
        const existing = prev[peerId] || { stream: new MediaStream(), videoEnabled: true };
        const stream = existing.stream;
        e.streams[0].getTracks().forEach(track => stream.addTrack(track));
        return { ...prev, [peerId]: { ...existing, stream } };
      });
    };

    if (isInitiator) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit('offer', { offer: pc.localDescription, to: peerId });
        })
        .catch(err => console.error('[WebRTC] Failed to create offer:', err));
    }

    return pc;
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      setStatus('Connected to signaling server');
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socketRef.current.emit('join-room', { roomId: callId });

        socketRef.current.on('room-full', () => {
          setStatus('Room is full');
        });

        socketRef.current.on('all-users', (users) => {
          users.forEach(id => createPeerConnection(id, true));
        });

        socketRef.current.on('user-joined', (id) => {
          createPeerConnection(id, false);
        });

        socketRef.current.on('user-left', (id) => {
          const pc = peerConnections.current[id];
          if (pc) {
            pc.close();
            delete peerConnections.current[id];
          }
          setRemotePeers(prev => {
            const peer = prev[id];
            if (peer?.stream) peer.stream.getTracks().forEach(t => t.stop());
            const { [id]: _, ...rest } = prev;
            return rest;
          });
        });

        socketRef.current.on('offer', async ({ offer, from }) => {
          const pc = peerConnections.current[from] || createPeerConnection(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('answer', { answer: pc.localDescription, to: from });
        });

        socketRef.current.on('answer', async ({ answer, from }) => {
          const pc = peerConnections.current[from];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socketRef.current.on('ice-candidate', ({ candidate, from }) => {
          const pc = peerConnections.current[from];
          if (pc) {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socketRef.current.on('media-toggle', ({ from, type, enabled }) => {
          setRemotePeers(prev => {
            const peer = prev[from];
            if (!peer) return prev;
            if (type === 'audio' && peer.stream) {
              peer.stream.getAudioTracks().forEach(t => (t.enabled = enabled));
            }
            if (type === 'video') {
              return { ...prev, [from]: { ...peer, videoEnabled: enabled } };
            }
            return { ...prev };
          });
        });
      })
      .catch(err => {
        console.error('[Media] Failed to get user media:', err);
        setStatus('Error accessing camera/mic');
      });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      localStream.current?.getTracks().forEach(track => track.stop());
      Object.values(remotePeers).forEach(p => p.stream?.getTracks().forEach(t => t.stop()));
      dispatch(leaveCall());
    };
  }, [callId, createPeerConnection, dispatch, remotePeers]);

  const toggleVideo = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      dispatch(setVideoEnabled(track.enabled));
      socketRef.current.emit('media-toggle', { type: 'video', enabled: track.enabled });
    }
  };

  const toggleAudio = () => {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      dispatch(setAudioEnabled(track.enabled));
      socketRef.current.emit('media-toggle', { type: 'audio', enabled: track.enabled });
    }
  };

  const handleLeaveCall = () => {
    Object.values(peerConnections.current).forEach(pc => pc.close());
    socketRef.current?.disconnect();
    localStream.current?.getTracks().forEach(track => track.stop());
    Object.values(remotePeers).forEach(p => p.stream?.getTracks().forEach(t => t.stop()));
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
          <Button variant="outlined" onClick={restartIce}>Restart ICE</Button>
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
        {Object.entries(remotePeers).map(([id, peer]) => (
          <video
            key={id}
            ref={el => {
              if (el && peer.stream && el.srcObject !== peer.stream) {
                el.srcObject = peer.stream;
              }
            }}
            autoPlay
            playsInline
            width="300"
            style={{
              borderRadius: 8,
              background: '#000',
              display: peer.videoEnabled ? 'block' : 'none'
            }}
          />
        ))}
      </Box>
    </Container>
  );
}
