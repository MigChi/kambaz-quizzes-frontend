import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type User = {
  _id: string;
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

type AccountState = {
  currentUser: User | null;
};

const initialState: AccountState = {
  currentUser: null,
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setCurrentUser: (state, { payload }: PayloadAction<User | null>) => {
      state.currentUser = payload;
    },
  },
});

export const { setCurrentUser } = accountSlice.actions;
export default accountSlice.reducer;
