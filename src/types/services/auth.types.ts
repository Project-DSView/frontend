type AuthResponse = {
  data: {
    auth_url?: string;
    token?: string;
    state?: string;
  };
  success: boolean;
};

interface UserProfile {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_teacher: boolean;
  profile_img: string;
}

interface UseAuthReturn {
  accessToken: string | null;
  profile: UserProfile | null;
  isInitialized: boolean;
  setIsInitialized: (value: boolean) => void;
  loadSession: () => Promise<{ token: string; profile: UserProfile } | null>;
  handleRefreshToken: () => Promise<string | null>;
  fetchUserProfile: (token: string) => Promise<UserProfile>;
  setAuthData: (token: string, userProfile: UserProfile) => Promise<void>;
  clearAuthData: () => void;
}

export type { AuthResponse, UserProfile, UseAuthReturn };
