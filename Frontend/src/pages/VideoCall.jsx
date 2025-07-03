import { 
  useEffect, 
  useRef, 
  useState, 
  useCallback 
} from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Box, 
  Tooltip, 
  Button, 
  IconButton, 
  Modal, 
  Stack 
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useSelector, useDispatch } from "react-redux";
import {
  leaveCall,
  setVideoEnabled,
  setAudioEnabled,
} from "../features/call/callSlice";
import { io } from "socket.io-client";

import ControlBar from "../components/ControlBar";
import VideoLayout from "../components/VideoLayout";



const SOCKET_URL = import.meta.env.VITE_SIGNALING_SERVER_URL;

export default function VideoCall() {
  const displayName = useSelector((state) => state.call.displayName);
  const callId = useSelector((state) => state.call.callId);
  const videoOn = useSelector((state) => state.call.videoOn);
  const audioOn = useSelector((state) => state.call.audioOn);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const localStream = useRef(null);
  const peerConnections = useRef({});
  const remotePeersRef = useRef({});
  const [remotePeers, setRemotePeers] = useState({});
  const [status, setStatus] = useState("Initializing...");
  const [localStreamState, setLocalStreamState] = useState(null);

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenTrackRef = useRef(null);

  const [infoModalOpen, setInfoModalOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleOpenInfoModal = () => {
    setInfoModalOpen(true);
  };

  const handleCloseInfoModal = () => {
    setInfoModalOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(callId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };


  const removePeer = useCallback((id) => {
    const pc = peerConnections.current[id];
    if (pc) {
      pc.close();
      delete peerConnections.current[id];
    }

    setRemotePeers((prev) => {
      const peer = prev[id];
      if (!peer) return prev;
      peer.stream?.getTracks().forEach((t) => t.stop());
      const { [id]: _removed, ...rest } = prev;
      remotePeersRef.current = rest;
      return rest;
    });
  }, []);

  useEffect(() => {
    remotePeersRef.current = remotePeers;
  }, [remotePeers]);

  const restartIce = useCallback(() => {
    Object.entries(peerConnections.current).forEach(([id, pc]) => {
      pc.createOffer({ iceRestart: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit("offer", {
            offer: pc.localDescription,
            to: id,
          });
        })
        .catch((err) =>
          console.error("[ICE] Failed to restart ICE for", id, err)
        );
    });
  }, []);

  const createPeerConnection = useCallback(
    (peerId, isInitiator) => {
      if (peerConnections.current[peerId])
        return peerConnections.current[peerId];

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerConnections.current[peerId] = pc;

      localStream.current
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream.current));

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socketRef.current.emit("ice-candidate", {
            candidate: e.candidate,
            to: peerId,
          });
        }
      };

      pc.ontrack = (e) => {
        setRemotePeers((prev) => {
          const existing = prev[peerId] || {
            stream: new MediaStream(),
            videoEnabled: true,
            audioEnabled: true,
          };
          const stream = existing.stream;
          e.streams[0].getTracks().forEach((track) => stream.addTrack(track));
          const updated = {
            ...prev,
            [peerId]: { ...existing, stream },
          };
          remotePeersRef.current = updated;
          return updated;
        });
      };

      pc.onconnectionstatechange = () => {
        if (["closed", "failed", "disconnected"].includes(pc.connectionState)) {
          removePeer(peerId);
        }
      };

      if (isInitiator) {
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .then(() => {
            socketRef.current.emit("offer", {
              offer: pc.localDescription,
              to: peerId,
            });
          })
          .catch((err) =>
            console.error("[WebRTC] Failed to create offer:", err)
          );
      }

      return pc;
    },
    [removePeer]
  );

  useEffect(() => {
    console.log("[VideoCall] Initializing...");
    socketRef.current = io(SOCKET_URL);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        setLocalStreamState(stream);

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = videoOn;
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = audioOn;
        }

        socketRef.current.emit(
          "join-room",
          { roomId: callId },
          ({ success }) => {
            if (success) {
              socketRef.current.emit("media-toggle", {
                type: "video",
                enabled: stream.getVideoTracks()[0]?.enabled ?? true,
              });
              socketRef.current.emit("media-toggle", {
                type: "audio",
                enabled: stream.getAudioTracks()[0]?.enabled ?? true,
              });
            }
          }
        );

        socketRef.current.on("room-full", () => {
          setStatus("Room is full");
        });

        socketRef.current.on("all-users", (users) => {
          const selfId = socketRef.current.id;
          users
            .filter((id) => id !== selfId)
            .forEach((id) => createPeerConnection(id, true));
        });

        socketRef.current.on("user-joined", (id) => {
          createPeerConnection(id, false);
        });

        socketRef.current.on("user-left", (id) => {
          removePeer(id);
        });

        socketRef.current.on("offer", async ({ offer, from }) => {
          const pc =
            peerConnections.current[from] || createPeerConnection(from, false);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit("answer", {
            answer: pc.localDescription,
            to: from,
          });
        });

        socketRef.current.on("answer", async ({ answer, from }) => {
          const pc = peerConnections.current[from];
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socketRef.current.on("ice-candidate", ({ candidate, from }) => {
          const pc = peerConnections.current[from];
          if (pc) {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        socketRef.current.on(
          "media-toggle",
          ({ from, type, enabled }) => {
            setRemotePeers((prev) => {
              const peer = prev[from];
              if (!peer) return prev;

              let updated = {
                ...prev,
                [from]: {
                  ...peer,
                  videoEnabled:
                    type === "video" ? enabled : peer.videoEnabled,
                  audioEnabled:
                    type === "audio" ? enabled : peer.audioEnabled ?? true,
                },
              };

              if (peer.stream) {
                if (type === "audio") {
                  peer.stream.getAudioTracks().forEach(
                    (t) => (t.enabled = enabled)
                  );
                }
                if (type === "video") {
                  peer.stream.getVideoTracks().forEach(
                    (t) => (t.enabled = enabled)
                  );
                }
              }

              remotePeersRef.current = updated;
              return updated;
            });
          }
        );
      })
      .catch((err) => {
        console.error("[Media] Failed to get user media:", err);
        setStatus("Error accessing camera/mic");
      });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      Object.keys(peerConnections.current).forEach((id) => removePeer(id));
      peerConnections.current = {};
      localStream.current?.getTracks().forEach((track) => track.stop());
    };
  }, [callId, createPeerConnection, dispatch, removePeer]);

  const toggleVideo = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      dispatch(setVideoEnabled(track.enabled));
      console.log("[VideoCall] Toggling video:", track.enabled);
      socketRef.current?.emit("media-toggle", {
        type: "video",
        enabled: track.enabled,
      });
    }
  };

  const toggleAudio = () => {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      dispatch(setAudioEnabled(track.enabled));
      console.log("[VideoCall] Toggling audio:", track.enabled);
      socketRef.current?.emit("media-toggle", {
        type: "audio",
        enabled: track.enabled,
      });
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream =
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (localStreamState) {
          setLocalStreamState(new MediaStream([screenTrack]));
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];

    if (videoTrack) {
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc
          .getSenders()
          .find((s) => s.track?.kind === "video");
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      setLocalStreamState(new MediaStream([videoTrack]));
      screenTrackRef.current?.stop();
      screenTrackRef.current = null;
      setIsScreenSharing(false);
    }
  };

  const handleLeaveCall = () => {
    Object.keys(peerConnections.current).forEach((id) => removePeer(id));
    socketRef.current?.disconnect();
    localStream.current?.getTracks().forEach((track) => track.stop());
    dispatch(leaveCall());
    window.location.href = "/";
  };

  const remotePeersArray = Object.entries(remotePeers).map(
    ([id, peer]) => ({
      id,
      stream: peer.stream,
      videoEnabled: peer.videoEnabled,
      audioEnabled: peer.audioEnabled,
    })
  );

  const isAlone = remotePeersArray.length === 0;


  return (
    <Box
      
      sx={{ position: "relative", minHeight: "100vh", paddingTop: 2 }}
    >
      {/* Info Button */}
      <Box
        position="absolute"
        top={0}
        left={0}
        zIndex={10}
      >
        <Tooltip title="Room Info">
          <IconButton onClick={handleOpenInfoModal} color="primary">
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <VideoLayout
        localStream={localStreamState}
        localVideoOn={videoOn}
        localAudioOn={audioOn}
        localLabel={displayName || "You"}
        remotePeers={remotePeersArray}
        callId={callId}
        isAlone={isAlone}
      />

      <ControlBar
        videoOn={videoOn}
        audioOn={audioOn}
        isScreenSharing={isScreenSharing}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={toggleScreenShare}
        onRestartIce={restartIce}
        onLeaveCall={handleLeaveCall}
      />

      <Modal
        open={infoModalOpen}
        onClose={handleCloseInfoModal}
        aria-labelledby="invite-title"
        aria-describedby="invite-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            minWidth: 300,
            textAlign: "center",
          }}
        >
          <Typography id="invite-title" variant="h6" gutterBottom>
            You’re alone in the call
          </Typography>
          <Typography
            id="invite-description"
            variant="subtitle1"
            gutterBottom
            color="text.secondary"
          >
            Share this Room ID with others:
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Typography
              variant="body1"
              sx={{
                background: "#333",
                color: "#fff",
                px: 2,
                py: 1,
                borderRadius: 1,
                fontFamily: "monospace",
              }}
            >
              {callId}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={handleCopy}
              startIcon={<ContentCopyIcon />}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}

