import { Box } from "@mui/material";
import VideoBox from "./VideoBox";

export default function VideoLayout({
  localStream,
  localVideoOn,
  localAudioOn,
  localLabel,
  remotePeers,
  callId,
  isAlone,
}) {
  if (isAlone) {
    return (
      <Box
        width="100%"
        height="calc(100vh - 200px)"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VideoBox
          stream={localStream}
          videoEnabled={localVideoOn}
          audioEnabled={localAudioOn}
          label={localLabel}
          muted={true}
          videoHeight="100%"
        />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      mt={4}
      gap={4}
      flexWrap="wrap"
    >
      <VideoBox
        stream={localStream}
        videoEnabled={localVideoOn}
        audioEnabled={localAudioOn}
        label={localLabel}
        muted={true}
      />

      {remotePeers.map((peer) => (
        <VideoBox
          key={peer.id}
          stream={peer.stream}
          videoEnabled={peer.videoEnabled}
          audioEnabled={peer.audioEnabled ?? true}
          label={`User ${peer.id.slice(-4)}`}
          muted={false}
        />
      ))}
    </Box>
  );
}
