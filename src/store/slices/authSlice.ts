import type { SafeUser, UserRole } from "@/db/schema";
import { type PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isLoggingOut: false,
  hasCheckedAuth: false,
  error: null,
};

// Check existing session via /api/auth/me
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      return rejectWithValue("Failed to check authentication status");
    }
    const data = await res.json();
    if (data.authenticated && data.user) {
      return { user: data.user as SafeUser };
    }
    return { user: null };
  } catch (_err) {
    return rejectWithValue("Network error checking authentication");
  }
});

// Login with email and password credentials
export const loginWithCredentials = createAsyncThunk(
  "auth/loginWithCredentials",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || "Login failed");
      }

      return { user: data.user as SafeUser, token: data.token as string };
    } catch (_err) {
      return rejectWithValue("Network error during login");
    }
  },
);

// 1-Click login with pre-configured demo account
export const loginWithDemo = createAsyncThunk(
  "auth/loginWithDemo",
  async (role: UserRole, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.error || "Demo login failed");
      }

      return { user: data.user as SafeUser, token: data.token as string };
    } catch (_err) {
      return rejectWithValue("Network error during demo switch");
    }
  },
);

// Logout
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) {
      return rejectWithValue("Logout failed");
    }
    return true;
  } catch (_err) {
    return rejectWithValue("Network error during logout");
  }
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserDirect: (state, action: PayloadAction<SafeUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.hasCheckedAuth = true;
      state.user = action.payload.user;
      state.isAuthenticated = !!action.payload.user;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.isLoading = false;
      state.hasCheckedAuth = true;
      state.user = null;
      state.isAuthenticated = false;
    });

    // Login Credentials
    builder.addCase(loginWithCredentials.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithCredentials.fulfilled, (state, action) => {
      state.isLoading = false;
      state.hasCheckedAuth = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginWithCredentials.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || "Login failed";
    });

    // Login Demo
    builder.addCase(loginWithDemo.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginWithDemo.fulfilled, (state, action) => {
      state.isLoading = false;
      state.hasCheckedAuth = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginWithDemo.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || "Demo login failed";
    });

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.isLoggingOut = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoggingOut = false;
      state.hasCheckedAuth = true;
      state.error = null;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      state.isLoggingOut = false;
    });
  },
});

export const { clearError, setUserDirect } = authSlice.actions;
export default authSlice.reducer;
