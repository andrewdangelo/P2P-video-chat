import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function ControlBar({
  videoOn,
  audioOn,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onRestartIce,
  onLeaveCall,
}) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const hoverColor = theme.palette.action.hover;

  const circleStyle = {
    width: 56,
    height: 56,
    borderRadius: "50%",
    bgcolor: theme.palette.background.paper,
    color: primaryColor,
    '&:hover': {
      bgcolor: hoverColor,
    },
  };

  const errorStyle = {
    ...circleStyle,
    bgcolor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      bgcolor: theme.palette.error.dark,
    },
  };

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 50,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 2,
        bgcolor: theme.palette.background.default,
        px: 3,
        py: 1,
        borderRadius: 10,
        boxShadow: 3,
        zIndex: 1000,
        backdropFilter: "blur(6px)",
      }}
    >
      <Tooltip title="Restart ICE">
        <IconButton onClick={onRestartIce} sx={circleStyle}>
          <RestartAltIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={videoOn ? "Turn Off Camera" : "Turn On Camera"}>
        <IconButton onClick={onToggleVideo} sx={circleStyle}>
          {videoOn ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={audioOn ? "Mute Mic" : "Unmute Mic"}>
        <IconButton onClick={onToggleAudio} sx={circleStyle}>
          {audioOn ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={isScreenSharing ? "Stop Sharing" : "Share Screen"}>
        <IconButton onClick={onToggleScreenShare} sx={circleStyle}>
          {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Leave Call">
        <IconButton onClick={onLeaveCall} sx={errorStyle}>
          <ExitToAppIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

