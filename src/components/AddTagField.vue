<script setup lang="ts">
import { colors } from '@/types/todolist';
import { IconSquareRoundedFilled } from '@tabler/icons-vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

defineProps(['placeholder']);

const open = ref<boolean>(false);
const input = ref();

const name = defineModel<string | null>('name');
const color = defineModel<string>('color');

const selectColor = (id: string) => {
  color.value = id;
  open.value = false;
  input.value.focus();
};

const onKeydown = (e: KeyboardEvent) => {
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    // openSearch();
  } else if (e.key === 'Escape') {
    open.value = false;
  }
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="input grow">
    <div style="anchor-name: --popover-anchor-tag" @click="open = !open" class="cursor-pointer">
      <IconSquareRoundedFilled :class="[`text-${color}`, 'size-5']" />
    </div>
    <input
      type="text"
      v-model="name"
      @focus="open = false"
      class="grow"
      ref="input"
      :placeholder
      id="add_tag_name"
    />
  </div>
  <div
    popover
    style="position-anchor: --popover-anchor-tag"
    :class="{
      'dropdown-open': open,
    }"
    class="dropdown fixed w-auto bg-base-100 z-100 mt-2 border border-base-300 rounded-box"
  >
    <ul class="menu w-full max-h-66 overflow-y-auto flex-nowrap">
      <li v-for="c in colors" :key="c.id">
        <button type="button" @click="selectColor(c.id)" :data-color="c.id">
          <IconSquareRoundedFilled :class="[`text-${c.id}`, 'size-5']" />
          {{ c.name }}
        </button>
      </li>
    </ul>
  </div>
</template>
