import { create } from 'zustand';

const useAuthStore = create((set) => ({
  session: null,
  user: null,
  profile: null,
  secretKey: null, // Memory ONLY - NEVER STORE IN LOCALSTORAGE OR DB
  
  setSession: (session) => set({ session, user: session?.user || null }),
  setProfile: (profile) => set({ profile }),
  setSecretKey: (key) => set({ secretKey: key }),
  
  logout: () => set({ session: null, user: null, profile: null, secretKey: null })
}));

export default useAuthStore;
