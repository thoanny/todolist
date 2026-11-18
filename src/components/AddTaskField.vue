<script setup lang="ts">
import { useTodolistStore } from '@/stores/todolist';
import { IconSquareRoundedFilled } from '@tabler/icons-vue';
import { storeToRefs } from 'pinia';
import { computed, nextTick, ref } from 'vue';

defineProps<{ placeholder?: string }>();

type Option = { id: string; name: string; color?: string | null };
type Trigger = { char: '/' | '#'; query: string; start: number; caret: number };

const name = defineModel<string | null>('name');
const date = defineModel<string | null>('date');
const tagsIds = defineModel<string[]>('tagsIds', { default: () => [] });
const categoryId = defineModel<string | null>('categoryId');

const todolistStore = useTodolistStore();
const { categories, tags } = storeToRefs(todolistStore);

const input = ref<HTMLInputElement | null>();
const trigger = ref<Trigger | null>(null); // { char, query, start, caret }
const active = ref<number>(0);

const getCategoryName = (id: string) => {
  return categories.value.find((c) => c.id === id)?.name || 'Inconnu';
};

const getTagName = (id: string) => {
  return tags.value.find((t) => t.id === id)?.name || 'Inconnu';
};

const items = computed<Option[]>(() => {
  if (!trigger.value) return [];
  const { char, query } = trigger.value;
  const source: Option[] =
    char === '/'
      ? categoryId.value
        ? []
        : categories.value
      : tags.value
          .filter((t) => !tagsIds.value.includes(t.id))
          .sort((a, b) => a.name.localeCompare(b.name));

  const q = query.toLocaleLowerCase();
  return source.filter((s) => s.name.toLocaleLowerCase().startsWith(q));
});

const onInput = () => {
  const el = input.value;
  if (!el) return;

  const caret = el.selectionStart ?? 0;
  const m = (name.value ?? '').slice(0, caret).match(/(?:^|\s)([/#])([^\s/#]*)$/);

  if (m) {
    const query = m[2] ?? '';
    trigger.value = { char: m[1] as '/' | '#', query, start: caret - query.length - 1, caret };
  } else {
    trigger.value = null;
  }
  active.value = 0;
};

const pick = async (item: Option) => {
  if (!trigger.value) return;

  const { char, start, caret } = trigger.value;
  const text = name.value ?? '';

  name.value = text.slice(0, start) + text.slice(caret);

  if (char === '/') categoryId.value = item.id;
  else tagsIds.value = [...tagsIds.value, item.id];

  trigger.value = null;

  await nextTick();

  input.value?.setSelectionRange(start, start);
  input.value?.focus();
};

const onKeydown = (e: KeyboardEvent) => {
  if (items.value.length) {
    const n = items.value.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active.value = (active.value + 1) % n;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      active.value = (active.value - 1 + n) % n;
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const item = items.value[active.value];
      if (item) pick(item);
      return;
    }
    if (e.key === 'Escape') {
      trigger.value = null;
      return;
    }
  }
  if (e.key === 'Backspace' && !name.value) {
    if (tagsIds.value.length) tagsIds.value = tagsIds.value.slice(0, -1);
    else categoryId.value = null;
  }
};
</script>

<template>
  <div
    class="input grow gap-1"
    popovertarget="popover-1"
    style="anchor-name: --popover-anchor-task"
  >
    <kbd class="kbd kbd-sm">/</kbd>
    <span v-if="categoryId" class="badge badge-primary badge-sm gap-1">
      /{{ getCategoryName(categoryId) }}
      <button type="button" @click.stop="categoryId = null">×</button>
    </span>
    <kbd class="kbd kbd-sm">#</kbd>
    <span v-for="t in tagsIds" :key="t" class="badge badge-secondary badge-sm gap-1">
      #{{ getTagName(t) }}
      <button type="button" @click.stop="tagsIds = tagsIds.filter((x) => x !== t)">×</button>
    </span>
    <input
      type="text"
      ref="input"
      v-model="name"
      @input="onInput"
      @keydown="onKeydown"
      @click="onInput"
      @blur="trigger = null"
      :placeholder
    />
    <input type="date" class="input w-28" v-model="date" />
  </div>
  <div
    style="position-anchor: --popover-anchor-task"
    :class="{
      'dropdown-open': items.length,
    }"
    class="dropdown fixed w-auto bg-base-100 z-100 mt-2 border border-base-300 rounded-box"
    popover
  >
    <ul v-if="items.length" class="menu w-full">
      <li v-for="(item, i) in items" :key="item.id">
        <a :class="{ 'menu-active': i === active }" @mousedown.prevent="pick(item)">
          <IconSquareRoundedFilled
            :class="[`text-${item.color}`, 'size-5', { 'text-secondary': !item.color }]"
            v-if="trigger?.char === '#'"
          />
          {{ trigger?.char }}{{ item.name }}
        </a>
      </li>
    </ul>
  </div>
</template>
