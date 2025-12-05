import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database.types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    cpf?: string,
    birthDate?: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  fetchProfile: () => Promise<void>; // Alias for refreshProfile
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        set({
          session,
          user: session.user,
          profile,
          isInitialized: true,
        });
      } else {
        set({
          session: null,
          user: null,
          profile: null,
          isInitialized: true,
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            session,
            user: session.user,
            profile,
          });
        } else {
          set({
            session: null,
            user: null,
            profile: null,
          });
        }
      });
    } catch {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      set({
        user: data.user,
        session: data.session,
        isLoading: false,
      });

      return { error: null };
    } catch {
      set({ isLoading: false });
      return { error: 'Erro ao fazer login' };
    }
  },

  signUp: async (email: string, password: string, name: string, cpf?: string, birthDate?: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            cpf,
            birth_date: birthDate,
          },
        },
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      // Create profile immediately after signup
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          name: name,
          cpf: cpf || null,
          birth_date: birthDate || null,
        });

        if (profileError) {
          console.log('Profile creation note:', profileError.message);
          // Don't fail signup if profile already exists (trigger might have created it)
        }

        // Fetch the profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({
          user: data.user,
          session: data.session,
          profile,
          isLoading: false,
        });
      } else {
        set({
          user: data.user,
          session: data.session,
          isLoading: false,
        });
      }

      return { error: null };
    } catch {
      set({ isLoading: false });
      return { error: 'Erro ao criar conta' };
    }
  },

  signOut: async () => {
    set({ isLoading: true });

    try {
      // Sign out with global scope to clear all sessions
      await supabase.auth.signOut({ scope: 'global' });

      // Clear local state
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Force clear state even on error
      set({
        user: null,
        session: null,
        profile: null,
        isLoading: false,
      });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      set({ isLoading: false });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch {
      return { error: 'Erro ao enviar email' };
    }
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      set({ profile });
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  },

  // Alias for refreshProfile
  fetchProfile: async () => {
    return get().refreshProfile();
  },
}));
