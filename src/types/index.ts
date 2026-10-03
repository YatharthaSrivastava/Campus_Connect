export interface User {
  id: string;
  email: string;
  fullName: string;
  collegeName?: string;
  collegeId?: string;
  department?: string;
  academicYear?: number;
  section?: string;
  bio?: string;
  avatarUrl?: string;
  karmaScore: number;
  isVerified: boolean;
  isProfileComplete: boolean;
  skillsOffered: string[];
  skillsNeeded: string[];
  averageRating: number;
  totalRatings: number;
  profileCompletionPct?: number;
  lastActiveAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
