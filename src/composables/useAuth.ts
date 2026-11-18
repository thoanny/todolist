import { startSync, stopSync } from '@/composables/useSync';
import { supabase } from '@/lib/supabase';
import { useTodolistStore } from '@/stores/todolist';
import type { User } from '@supabase/supabase-js';
import { ref } from 'vue';

export const recovering = ref(false);

export const user = ref<User | null>(null);

export const initAuth = () => {
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null;
    if (event === 'PASSWORD_RECOVERY') recovering.value = true;
    setTimeout(() => (session ? startSync(session.user.id) : stopSync()), 0);
  });
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
  return !!data.session;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
};

export const setNewPassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  recovering.value = false;
};

export const logout = async () => {
  stopSync();
  await supabase.auth.signOut();
  useTodolistStore().$reset();
};
