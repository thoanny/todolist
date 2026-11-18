import { supabase } from '@/lib/supabase';
import { useTodolistStore } from '@/stores/todolist';
import { watch } from 'vue';

let userId: string | null = null;
let stopWatch: (() => void) | null = null;
let timer: number | undefined;
let last = '';

const snapshot = () => {
  const s = useTodolistStore();
  return { tasks: s.tasks, categories: s.categories, layout: s.layout, tags: s.tags };
};

const pull = async (): Promise<boolean> => {
  const { data } = await supabase
    .from('todolist_state')
    .select('data')
    .eq('user_id', userId!)
    .maybeSingle();

  if (!data) return false;

  const store = useTodolistStore();
  last = JSON.stringify(data.data);
  store.$patch((s) => Object.assign(s, data.data));
  store.syncLayout();
  return true;
};

const push = async () => {
  const json = JSON.stringify(snapshot());
  if (json === last) return;
  const { error } = await supabase.from('todolist_state').upsert({
    user_id: userId,
    data: snapshot(),
    updated_at: new Date().toISOString(),
  });
  if (!error) last = json;
};

const onVisible = () => {
  if (document.visibilityState === 'visible' && userId) pull();
};

export const startSync = async (id: string) => {
  if (userId === id) return;
  stopSync();
  userId = id;

  if (!(await pull())) await push();

  const store = useTodolistStore();
  stopWatch = watch(
    () => [store.tasks, store.categories, store.layout, store.tags],
    () => {
      clearTimeout(timer);
      timer = window.setTimeout(push, 1000);
    },
    {
      deep: true,
    },
  );

  document.addEventListener('visibilitychange', onVisible);
};

export const stopSync = () => {
  stopWatch?.();
  stopWatch = null;
  clearTimeout(timer);
  document.removeEventListener('visibilitychange', onVisible);
  userId = null;
  last = '';
};
