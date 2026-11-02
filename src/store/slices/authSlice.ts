import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserRole } from '../../constants/roles';
import { User } from '../../types/models';

type AuthState = {
  token: string | null;
  user: User | null;
  /** Role picked on the role-select screen before login. */
  selectedRole: UserRole | null;
  isBootstrapped: boolean;
};

const initialState: AuthState = {
  token: null,
  user: null,
  selectedRole: null,
  isBootstrapped: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSelectedRole(state, action: PayloadAction<UserRole>) {
      state.selectedRole = action.payload;
    },
    clearSelectedRole(state) {
      state.selectedRole = null;
    },
    setCredentials(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setBootstrapped(state) {
      state.isBootstrapped = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setSelectedRole, clearSelectedRole, setCredentials, setBootstrapped, logout } = authSlice.actions;
export default authSlice.reducer;
