import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Box,
  Divider,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import ShareIcon from '@mui/icons-material/Share';
import VideoChatIcon from '@mui/icons-material/VideoChat';

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { joinCall } from '../features/call/callSlice';
import { v4 as uuidv4 } from 'uuid';

import JoinModal from '../components/Modals/JoinModal';
import Navbar from '../components/Navbar';

import Logo from "../assets/icons/main_icon.svg";
import { generateShortRoomId } from '../utils/generateRandomId';

export default function Home() {
  const [joinOpen, setJoinOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStartCall = () => {
    const roomId = generateShortRoomId();
    // Ensure roomId is unique and valid
    if (!roomId) {
      console.error('Failed to generate a valid room ID');
      return;
    }
    dispatch(joinCall({ callId: roomId, displayName: '', videoOn: true, audioOn: true }));
    navigate(`/lobby/${roomId}`);
  };

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <Container
        maxWidth="md"
        sx={{
          mt: 12,
          textAlign: 'center',
          backgroundColor: 'background.default',
          py: 6,
        }}
      >
        {/* Optional centered logo */}
       {/*  <img src={Logo} alt="App Logo" style={{ width: 100, marginBottom: 8 }} />

        {/* Subtitle / slogan 
        <Typography
          variant="body2"
          color="primary"
          sx={{ letterSpacing: 2, mb: 2, fontWeight: 500 }}
        >
          SEAMLESS CALL
        </Typography> */}

        {/* Main Heading */}
        <Typography
          variant="h3"
          color="primary"
          sx={{ fontWeight: 700, textTransform: 'uppercase' }}
          gutterBottom
        >
          Seamless Video Calling
        </Typography>

        {/* Description */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Create or join a room and start chatting with privacy and simplicity.
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button variant="contained" size="large" onClick={handleStartCall}>
            Start Call
          </Button>
          <Button variant="outlined" size="large" onClick={() => setJoinOpen(true)}>
            Join Call
          </Button>
        </Stack>
      </Container>


      {/* How It Works */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: '#fff',
          py: { xs: 8, md: 10 },
          px: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              mb: 6,
            }}
          >
            How It Works
          </Typography>

          <Grid container spacing={6} justifyContent="center">
            {/* Step 1 */}
            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2} alignItems="center">
                <LinkIcon sx={{ fontSize: 60, color: '#fff' }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, textTransform: 'uppercase', color: '#fff' }}
                >
                  Step 1: Create or Get a Link
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 280, color: '#e0f2f1' }}>
                  Go to the Lobby to generate a unique room link or get one from a friend.
                </Typography>
              </Stack>
            </Grid>

            {/* Step 2 */}
            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2} alignItems="center">
                <ShareIcon sx={{ fontSize: 60, color: '#fff' }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, textTransform: 'uppercase', color: '#fff' }}
                >
                  Step 2: Join or Share
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 280, color: '#e0f2f1' }}>
                  Send your call link to someone, or enter theirs to join them instantly.
                </Typography>
              </Stack>
            </Grid>

            {/* Step 3 */}
            <Grid item xs={12} sm={6} md={4}>
              <Stack spacing={2} alignItems="center">
                <VideoChatIcon sx={{ fontSize: 60, color: '#fff' }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, textTransform: 'uppercase', color: '#fff' }}
                >
                  Step 3: Start Chatting
                </Typography>
                <Typography variant="body2" sx={{ maxWidth: 280, color: '#e0f2f1' }}>
                  Connect via video and audio in your private peer-to-peer room.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" textAlign="center" fontWeight={600} gutterBottom>
          Features You'll Love
        </Typography>
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
          {[
            {
              title: 'End-to-End Privacy',
              desc: 'Peer-to-peer WebRTC connections with no servers in the middle.',
            },
            {
              title: 'No Signups Required',
              desc: 'Instant access — start or join with just one click.',
            },
            {
              title: 'Works on All Devices',
              desc: 'Browser-based calling compatible with desktop and mobile.',
            },
            {
              title: 'Screen Sharing',
              desc: 'Share your entire screen or just a window during any call.',
            },
            {
              title: 'Mute & Camera Toggle',
              desc: 'You’re always in control of how you appear and sound.',
            },
            {
              title: 'Ultra Low Latency',
              desc: 'Built for speed with WebRTC’s real-time communication.',
            },
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider variant="middle" sx={{ my: 8 }} />

      {/* Testimonials */}
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Trusted by Users Around the World
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }} justifyContent="center">
          {[
            {
              name: 'Alex R.',
              text: 'I love how quick and simple it is to hop into a call. No logins, no hassle.',
              avatar: '/avatars/alex.png',
            },
            {
              name: 'Jenna M.',
              text: 'Great for remote teams. The quality is top-notch and it just works.',
              avatar: '/avatars/jenna.png',
            },
            {
              name: 'Luis K.',
              text: 'Privacy matters to me — and this app respects that completely.',
              avatar: '/avatars/luis.png',
            },
          ].map((review, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card elevation={3}>
                <CardContent>
                  <Avatar src={review.avatar} sx={{ width: 56, height: 56, mb: 1, mx: 'auto' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {review.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    “{review.text}”
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Divider variant="middle" sx={{ my: 8 }} />

      {/* FAQ */}
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={600} textAlign="center" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Box mt={4}>
          {[
            {
              q: 'Is this really private?',
              a: 'Yes — calls are direct peer-to-peer using WebRTC, with no media passing through any server.',
            },
            {
              q: 'Do I need to install anything?',
              a: 'No installs required. It works entirely in modern browsers.',
            },
            {
              q: 'How many people can join a call?',
              a: 'Up to 4 users per call with full-mesh peer connections for performance.',
            },
            {
              q: 'Is it free to use?',
              a: 'Yes, this app is completely free with no ads or subscriptions.',
            },
          ].map((item, i) => (
            <Accordion key={i}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>{item.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* Final CTA */}
      <Box sx={{ backgroundColor: '#f5f5f5', py: 10, mt: 10 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Get Started Now
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Your next call is just one click away. Start a secure, instant video chat today.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Button variant="contained" size="large" onClick={handleStartCall}>
              Start a New Call
            </Button>
            <Button variant="outlined" size="large" onClick={() => setJoinOpen(true)}>
              Join Existing Call
            </Button>
          </Stack>
        </Container>
      </Box>

      <JoinModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  );
}

