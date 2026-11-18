import { supabase } from '@/lib/supabase';
import { useTodolistStore } from '@/stores/todolist';
import type { User } from '@supabase/supabase-js';
import { ref } from 'vue';
import { startSync, stopSync } from './useSync';

export const user = ref<User | null>(null);

export const initAuth = () => {
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
    setTimeout(() => (session ? startSync(session.user.id) : stopSync()), 0);
  });
};

export const signIn = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
};

export const logout = async () => {
  stopSync();
  await supabase.auth.signOut();
  useTodolistStore().$reset();
};
