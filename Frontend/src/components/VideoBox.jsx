import { Box, Typography } from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";

/**
 * VideoBox displays either a video stream or a placeholder box when video is off.
 *
 * Props:
 * - stream: MediaStream | null
 * - videoEnabled: boolean
 * - audioEnabled: boolean
 * - label: string (e.g. username or "You")
 * - muted: boolean (default: false)
 * - videoWidth: string | number (default: "100%")
 * - aspectRatio: string (default: "16 / 9")
 */
export default function VideoBox({
  stream,
  videoEnabled,
  audioEnabled,
  label,
  muted = false,
  videoWidth = "auto",
  videoHeight = "auto",
  aspectRatio = "16 / 9",
}) {
  const videoRef = (el) => {
    if (el && stream && el.srcObject !== stream) {
      el.srcObject = stream;
    }
  };

  return (
    <Box
      width={videoWidth}
      height={videoHeight}
      sx={{
        aspectRatio,
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#000",
      }}
    >
      {videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          width="100%"
          height="100%"
          bgcolor="#222"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          fontSize={16}
          fontWeight={500}
        >
          Camera Off
        </Box>
      )}

      {/* Name label bar */}
      <Box
        position="absolute"
        bottom={0}
        width="100%"
        color="white"
        px={1}
        py={0.5}
        fontSize={12}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))",
        }}
      >
        <Typography variant="caption">{label}</Typography>
        {audioEnabled ? (
          <Mic fontSize="small" />
        ) : (
          <MicOff fontSize="small" color="error" />
        )}
      </Box>
    </Box>
  );
}
