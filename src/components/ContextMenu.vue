<script setup lang="ts">
import type { ContextMenu } from '@/composables/useContextMenu';

defineProps<{
  menu: ContextMenu;
}>();
</script>

<template>
  <Teleport to="body">
    <ul
      v-if="menu.visible.value"
      class="menu bg-base-100 border border-base-300 rounded-box w-42"
      :style="{
        position: 'fixed',
        left: menu.x.value + 'px',
        top: menu.y.value + 'px',
      }"
      @click.stop
    >
      <slot />
    </ul>
  </Teleport>
</template>
