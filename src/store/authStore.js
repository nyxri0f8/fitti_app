import { create } from 'zustand';

const useAuthStore = create((set) => ({
  session: null,
  user: null,
  profile: null,
  secretKey: null,
  activeCall: null,
  
  setSession: (session) => set({ session, user: session?.user || null }),
  setProfile: (profile) => set({ profile }),
  setSecretKey: (key) => set({ secretKey: key }),
  setActiveCall: (activeCall) => set({ activeCall }),
  
  logout: () => set({ session: null, user: null, profile: null, secretKey: null, activeCall: null })
}));

export default useAuthStore;
