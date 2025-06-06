import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  displayName: '',
  callId: '',
  videoOn: true,
  audioOn: true,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    joinCall: (state, action) => {
      state.displayName = action.payload.displayName;
      state.callId = action.payload.callId;
    },
    leaveCall: (state) => {
      state.displayName = '';
      state.callId = '';
      state.videoOn = true;
      state.audioOn = true;
    },
    setVideoEnabled: (state, action) => {
      state.videoOn = action.payload;
    },
    setAudioEnabled: (state, action) => {
      state.audioOn = action.payload;
    },
  },
});

export const { joinCall, leaveCall, setVideoEnabled, setAudioEnabled } = callSlice.actions;
export default callSlice.reducer;


