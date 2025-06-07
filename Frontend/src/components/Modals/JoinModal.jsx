import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

import { useDispatch } from 'react-redux';
import { joinCall } from '../../features/call/callSlice';
import { useNavigate } from 'react-router-dom';


export default function JoinModal({ open, onClose }) {
  const [callId, setCallId] = useState('');
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();


    const handleJoinCall = () => {
    const safeCallId = callId || '';
    const safeName = name || '';

    if (!safeName.trim() || !safeCallId.trim()) return;

    dispatch(joinCall({
        callId: safeCallId,
        displayName: safeName,
        videoOn: true,
        audioOn: true,
    }));

    navigate(`/lobby/${safeCallId}`);
    };


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Join a Call</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Call ID"
          fullWidth
          variant="outlined"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Your Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
            onClick={handleJoinCall}
            variant="contained"
            disabled={!name || !callId}
        >
            Join
        </Button>

      </DialogActions>
    </Dialog>
  );
}
