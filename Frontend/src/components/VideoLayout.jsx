import { useState, useEffect } from "react";
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

  const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
            });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);


    
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
          aspectRatio="16/9"
        />
      </Box>
    );
  }

  const allVideos = [
    {
      id: "local",
      stream: localStream,
      videoEnabled: localVideoOn,
      audioEnabled: localAudioOn,
      label: localLabel,
      muted: true,
    },
    ...remotePeers.map((peer) => ({
      id: peer.id,
      stream: peer.stream,
      videoEnabled: peer.videoEnabled,
      audioEnabled: peer.audioEnabled ?? true,
      label: `User ${peer.id.slice(-4)}`,
      muted: false,
    })),
  ];

  const totalVideos = allVideos.length;

  const screenWidth = windowSize.width;
  const screenHeight = windowSize.height - 200;
  
  const gap = 24;
  const preferredAspectRatio = 16 / 9;
  const safetyScale = 0.98;

  let bestLayout = null;

  for (let cols = 1; cols <= totalVideos; cols++) {
    const rows = Math.ceil(totalVideos / cols);

    let boxWidth =
      (screenWidth - gap * (cols - 1)) / cols;

    let boxHeight = boxWidth / preferredAspectRatio;

    const totalHeight =
      rows * boxHeight + (rows - 1) * gap;

    if (totalHeight > screenHeight) {
      // reduce height to fit
      boxHeight =
        (screenHeight - gap * (rows - 1)) / rows;
      boxWidth = boxHeight * preferredAspectRatio;
    }

    const totalWidth =
      boxWidth * cols + gap * (cols - 1);

    if (
      totalWidth <= screenWidth &&
      boxWidth > 0 &&
      boxHeight > 0
    ) {
      boxWidth *= safetyScale;
      boxHeight *= safetyScale;

      if (
        !bestLayout ||
        boxWidth * boxHeight >
          bestLayout.boxWidth * bestLayout.boxHeight
      ) {
        bestLayout = {
          cols,
          rows,
          boxWidth,
          boxHeight,
        };
      }
    }
  }

  if (!bestLayout) {
    // fallback
    bestLayout = {
      cols: 1,
      rows: totalVideos,
      boxWidth: screenWidth,
      boxHeight: (screenWidth) / preferredAspectRatio,
    };
  }

  const { cols, boxWidth, boxHeight } = bestLayout;

  const rowsArray = [];
  for (let i = 0; i < allVideos.length; i += cols) {
    rowsArray.push(allVideos.slice(i, i + cols));
  }

    return (
    <Box
        width="100%"
        height="calc(100vh - 200px)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={`${gap}px`}
        px={2}
    >
        {rowsArray.map((row, rowIndex) => (
        <Box
            key={rowIndex}
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="fit-content"
            mx="auto"
            gap={`${gap}px`}
        >
            {row.map((peer) => (
            <Box
                key={peer.id}
                width={`${boxWidth}px`}
                height={`${boxHeight}px`}
            >
                <VideoBox
                stream={peer.stream}
                videoEnabled={peer.videoEnabled}
                audioEnabled={peer.audioEnabled}
                label={peer.label}
                muted={peer.muted}
                videoWidth="100%"
                videoHeight="100%"
                aspectRatio={`${boxWidth / boxHeight}`}
                />
            </Box>
            ))}
        </Box>
        ))}
    </Box>
    );

}
