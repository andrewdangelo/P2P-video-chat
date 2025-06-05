import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* NavBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            My WebRTC App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Welcome Section */}
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Seamless Video Calling
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Create or join a room and start chatting with privacy and simplicity.
        </Typography>

        {/* Two buttons side by side */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            component={Link}
            to="/lobby"
            variant="contained"
            color="primary"
            size="large"
          >
            Start Call
          </Button>
          <Button
            component={Link}
            to="/lobby"
            variant="outlined"
            color="primary"
            size="large"
          >
            Join Call
          </Button>
        </Stack>
      </Container>

      {/* Steps Section */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Step 1: Create or Get a Link
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Go to the Lobby to generate a unique room link or get one from a friend.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Step 2: Join or Share
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send your call link to someone, or enter theirs to join them instantly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Step 3: Start Chatting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect via video and audio in your private peer-to-peer room.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
