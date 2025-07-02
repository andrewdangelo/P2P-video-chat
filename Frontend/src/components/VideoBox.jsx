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
 */
export default function VideoBox({
  stream,
  videoEnabled,
  audioEnabled,
  label,
  muted = false,
  videoWidth = 300,
  videoHeight = 225,
  
}) {
  const videoRef = (el) => {
    if (el && stream && el.srcObject !== stream) {
      el.srcObject = stream;
    }
  };

    return (
    <Box
        width={ videoWidth }
        height={ videoHeight }
        borderRadius={2}
        bgcolor="#000"
        overflow="hidden"
        position="relative"
    >
        {videoEnabled && stream ? (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
        bgcolor="rgba(0,0,0,0.5)"
        color="white"
        px={1}
        py={0.5}
        fontSize={12}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
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
