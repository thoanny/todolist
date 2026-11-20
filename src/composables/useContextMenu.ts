import { onMounted, onUnmounted, ref } from 'vue';

export type ContextMenu = ReturnType<typeof useContextMenu>;

export const useContextMenu = () => {
  const visible = ref<boolean>(false);
  const x = ref<number>(0);
  const y = ref<number>(0);

  const open = (
    event: MouseEvent,
    width: number | null = null,
    height: number | null = null,
  ): void => {
    event.preventDefault();

    const menuWidth = width ?? 160;
    const menuHeight = height ?? 200;

    x.value =
      event.clientX + menuWidth > window.innerWidth ? event.clientX - menuWidth : event.clientX;

    y.value =
      event.clientY + menuHeight > window.innerHeight ? event.clientY - menuHeight : event.clientY;

    visible.value = true;
  };

  const close = (): void => {
    visible.value = false;
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && visible.value) {
      close();
      return;
    }
  };

  onMounted(() => {
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    window.addEventListener('scroll', close);
    window.addEventListener('keydown', onKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('click', close);
    window.removeEventListener('contextmenu', close);
    window.removeEventListener('scroll', close);
    window.removeEventListener('keydown', onKeydown);
  });

  return { visible, x, y, open, close };
};
