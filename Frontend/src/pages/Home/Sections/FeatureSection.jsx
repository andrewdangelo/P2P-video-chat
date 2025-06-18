import { useState } from 'react';
import { Box, Typography, Button, Grid, Container } from '@mui/material';
import { useSpring, animated as a } from '@react-spring/web';


import PrivacySVG from '../../../assets/images/security.svg';
import SignupSVG from '../../../assets/images/signup.svg';
import DevicesSVG from '../../../assets/images/browser.svg';

const features = [
  {
    title: 'End-to-End Privacy',
    desc: 'Peer-to-peer WebRTC connections with no servers in the middle.',
    more: 'Your call data is never stored or routed through external servers—pure peer-to-peer encryption.',
    img: PrivacySVG,
  },
  {
    title: 'No Signups Required',
    desc: 'Instant access — start or join with just one click.',
    more: 'No accounts, no forms. Click a link and start talking. It’s that simple.',
    img: SignupSVG,
  },
  {
    title: 'Works on All Devices',
    desc: 'Browser-based calling compatible with desktop and mobile.',
    more: 'Supports Chrome, Firefox, Safari, and mobile browsers with no downloads required.',
    img: DevicesSVG,
  },
];

function FeatureFlipCard({ feature }) {
  const [flipped, setFlipped] = useState(false);

  const styles = useSpring({
    transform: `rotateY(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  return (
    <Box
      sx={{
        width: '100%',
        height: 360,
        position: 'relative',
        perspective: 1000,
      }}
    >
      <a.div
        style={{
          ...styles,
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front Face */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: '#fff',
            borderRadius: 4,
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Box component="img" src={feature.img} alt={feature.title} sx={{ width: 80, height: 80 }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1C8757' }}>
            {feature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4F4F4F', mb: 2 }}>
            {feature.desc}
          </Typography>
          <Button
            variant="contained"
            onClick={() => setFlipped(true)}
            sx={{
              backgroundColor: '#2ACF85',
              color: '#fff',
              borderRadius: 20,
              textTransform: 'none',
              px: 4,
              '&:hover': { backgroundColor: '#1C8757' },
            }}
          >
            More
          </Button>
        </Box>

        {/* Back Face */}
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#F4FBF8',
            borderRadius: 4,
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1C8757' }}>
            {feature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#1C8757', mb: 2 }}>
            {feature.more}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setFlipped(false)}
            sx={{
              borderColor: '#1C8757',
              color: '#1C8757',
              borderRadius: 20,
              textTransform: 'none',
              px: 4,
              '&:hover': { borderColor: '#2ACF85', color: '#2ACF85' },
            }}
          >
            Back
          </Button>
        </Box>
      </a.div>
    </Box>
  );
}



export default function TopFeaturesSection() {
  return (
    <Container sx={{ py: 10, backgroundColor: '#EAF7F1', minWidth: '100%' }}>
      <Typography
        variant="overline"
        textAlign="center"
        sx={{ color: '#6B9080', letterSpacing: 2 }}
      >
        FEATURES
      </Typography>
      <Typography
        variant="h4"
        textAlign="center"
        fontWeight={700}
        sx={{ color: '#2ACF85', mb: 6 }}
      >
        Our Features & Services.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {features.map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
            <FeatureFlipCard feature={feature} />
            </Grid>
        ))}
        </Grid>

    </Container>
  );
}
