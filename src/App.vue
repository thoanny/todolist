<script setup lang="ts">
import AddTagField from '@/components/AddTagField.vue';
import AddTaskField from '@/components/AddTaskField.vue';
import ContextMenu from '@/components/ContextMenu.vue';
import { initAuth } from '@/composables/useAuth';
import { useContextMenu } from '@/composables/useContextMenu';
import { UNCATEGORIZED, useTodolistStore } from '@/stores/todolist';
import { colors, types, type Task } from '@/types/todolist';
import {
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconFolder,
  IconFolderOpen,
  IconGripVertical,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSquareRounded,
  IconSquareRoundedCheck,
  IconTrash,
  IconX,
} from '@tabler/icons-vue';
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import AuthButton from './components/AuthButton.vue';

initAuth();

const menu = useContextMenu();
const activeMenuItem = ref<{ type: null | string; id: null | string; open: boolean }>({
  type: null,
  id: null,
  open: false,
});

const todolistStore = useTodolistStore();
const {
  addTask,
  addCategory,
  moveCategory,
  removeCategory,
  toggleTaskCompleted,
  toggleCategoryCollapsed,
  addTag,
  removeTask,
  duplicateTask,
} = todolistStore;
const { tasksFiltered, tasksById, categories, layout, tags, search, filteredIds, tagFilter } =
  storeToRefs(todolistStore);

const currentTypeId = ref<'task' | 'tag' | 'category' | 'tab' | string>('task');
const currentType = computed(() => {
  return types.find((type) => type.id === currentTypeId.value) || null;
});
const name = ref<string>('');
const date = ref<string | null>(null);
const color = ref(colors[0]!.id);
const categoryId = ref();
const tagsIds = ref([]);
const showSearch = ref<boolean>(true);

const handleSubmit = () => {
  switch (currentTypeId.value) {
    case 'task':
      const key = (Math.random() + 1).toString(36).substring(5);
      const task: Task = {
        id: key,
        name: name.value,
        date: date.value,
        completed: false,
        tags: [...tagsIds.value],
      };
      addTask(task, categoryId.value);
      break;
    case 'tag':
      addTag(name.value, color.value);
      break;
    case 'category':
      addCategory(name.value);
      break;
    case 'tab':
      break;
  }

  name.value = '';
  date.value = null;
  color.value = colors[0]!.id;
  // categoryId.value = null;
  // tagsIds.value = [];
};

const sections = computed(() => [
  { id: UNCATEGORIZED, name: 'Sans catégorie', collapsed: false, custom: false },
  ...categories.value,
]);

const tasksOf = (sectionId: string): Task[] =>
  (layout.value[sectionId] ?? [])
    .filter((id) => filteredIds.value.has(id))
    .map((id) => tasksById.value.get(id))
    .filter((task): task is Task => task !== undefined);

const dragDisabled = computed(() => !!search.value.trim() || !!tagFilter.value);

const getTagName = (id: string) => {
  return tags.value.find((t) => t.id === id)?.name || 'Inconnu';
};

const getTagColor = (id: string) => {
  return tags.value.find((t) => t.id === id)?.color || 'secondary';
};

const handleMoveCategory = (direction: 1 | -1) => {
  if (!activeMenuItem.value.id || activeMenuItem.value.type !== 'category') return;
  moveCategory(activeMenuItem.value.id, direction);
  menu.close();
};

const handleRemoveCategory = () => {
  if (!activeMenuItem.value.id || activeMenuItem.value.type !== 'category') return;
  if (categoryId.value === activeMenuItem.value.id) {
    categoryId.value = null;
  }
  removeCategory(activeMenuItem.value.id);
  menu.close();
};

const handleToggleTaskCompleted = () => {
  if (!activeMenuItem.value.id || activeMenuItem.value.type !== 'task') return;
  toggleTaskCompleted(activeMenuItem.value.id);
  menu.close();
};

const handleRemoveTask = () => {
  if (!activeMenuItem.value.id || activeMenuItem.value.type !== 'task') return;
  removeTask(activeMenuItem.value.id);
  menu.close();
};

const handleDuplicateTask = () => {
  if (!activeMenuItem.value.id || activeMenuItem.value.type !== 'task') return;
  duplicateTask(activeMenuItem.value.id);
  menu.close();
};

const isTyping = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement;
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) || t.isContentEditable;
};

const onKeydown = (e: KeyboardEvent) => {
  const mod = e.ctrlKey || e.metaKey;

  if (mod && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (showSearch.value) {
      search.value = '';
      tagFilter.value = null;
    }
    showSearch.value = !showSearch.value;
    return;
  } else if (e.key === '1' || e.key === '&') {
    if (isTyping(e)) return;
    currentTypeId.value = 'task';
    return;
  } else if (e.key === '2' || e.key === 'é') {
    if (isTyping(e)) return;
    currentTypeId.value = 'tag';
    return;
  } else if (e.key === '3' || e.key === '"&é"') {
    if (isTyping(e)) return;
    currentTypeId.value = 'category';
    return;
  }
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <header class="sticky top-0 bg-base-100 z-99 border-b border-base-300">
    <div class="flex flex-col lg:flex-row gap-2 p-4">
      <div>
        <div role="tablist" class="tabs tabs-box tabs-sm text-xs">
          <button
            role="tab"
            class="tab gap-1"
            v-for="type in types"
            :key="type.id"
            :class="{ 'tab-active': currentTypeId === type.id }"
            @click="
              currentTypeId = type.id;
              name = '';
            "
          >
            <component :is="type.icon" v-if="type.icon" class="size-4" />
            {{ type.name }}
            <kbd class="kbd kbd-sm">{{ type.kbd }}</kbd>
          </button>
        </div>
      </div>
      <form @submit.prevent="handleSubmit" class="flex grow gap-2">
        <input
          type="text"
          class="input grow"
          :placeholder="currentType?.add_item"
          v-model="name"
          v-if="currentTypeId === 'category'"
        />
        <AddTaskField
          :placeholder="currentType?.add_item"
          v-model:name="name"
          v-model:date="date"
          v-model:tagsIds="tagsIds"
          v-model:categoryId="categoryId"
          v-else-if="currentTypeId === 'task'"
        />
        <AddTagField
          v-model:color="color"
          v-model:name="name"
          :placeholder="currentType?.add_item"
          v-else-if="currentTypeId === 'tag'"
        />
        <button type="submit" class="btn btn-primary btn-square">
          <IconPlus class="size-5" />
        </button>
      </form>

      <button class="btn btn-primary btn-square" v-if="false">
        <IconSearch class="size-5" />
      </button>
      <AuthButton />
    </div>
  </header>

  <main class="flex flex-col grow select-none">
    <div class="p-4 flex flex-col sm:flex-row border-b border-base-300 gap-2" v-show="showSearch">
      <div class="input grow w-full">
        <IconSearch class="opacity-25 size-5" />
        <input type="text" placeholder="Chercher des tâches" class="grow" v-model="search" />
        <kbd class="kbd kbd-sm">Ctrl+K</kbd>
      </div>
      <select class="select" v-model="tagFilter">
        <option :value="null">-- Étiquette --</option>
        <option :value="tag.id" v-for="tag in tags" :key="tag.id" class="truncate">
          #{{ tag.name }}
        </option>
      </select>
      <button
        type="button"
        @click="
          search = '';
          tagFilter = null;
        "
        class="btn sm:btn-square"
        :disabled="!dragDisabled"
      >
        <IconX class="size-4" />
        <span class="sm:hidden">Réinitialiser les filtres</span>
      </button>
    </div>
    <div class="flex flex-col grow">
      <template v-if="tasksFiltered.length > 0">
        <section
          v-for="section in sections"
          :key="section.id"
          class=""
          @contextmenu.prevent.stop="
            (e) => {
              activeMenuItem = { type: 'category', id: section.id, open: !section.collapsed };
              menu.open(e, 168, 244);
            }
          "
          v-show="!search || tasksOf(section.id).length"
        >
          <header class="flex gap-2 items-center py-2 px-4 border-b border-base-300 bg-base-200">
            <div class="cursor-pointer" @click.prevent="toggleCategoryCollapsed(section.id)">
              <IconFolderOpen t v-if="section.id === UNCATEGORIZED || !section.collapsed" />
              <IconFolder v-else />
            </div>
            <h2 class="grow font-bold">{{ section.name }}</h2>
          </header>

          <VueDraggable
            :model-value="layout[section.id] ?? []"
            @update:model-value="(ids: string[]) => (layout[section.id] = ids)"
            group="tasks"
            handle=".drag-handle"
            :animation="150"
            v-show="!section.collapsed"
            :disabled="dragDisabled"
          >
            <div
              v-for="task in tasksOf(section.id)"
              :key="task.id"
              class="flex items-center gap-2 px-4 py-2 border-b border-base-300"
              :class="[{ 'opacity-40': task.completed }]"
              @contextmenu.prevent.stop="
                (e) => {
                  activeMenuItem = { type: 'task', id: task.id, open: !task.completed };
                  menu.open(e, 168, 178);
                }
              "
            >
              <div
                class="drag-handle"
                :class="{ 'cursor-no-drop': dragDisabled, 'cursor-grab': !dragDisabled }"
              >
                <IconGripVertical
                  class="size-5"
                  :class="{
                    'text-base-content/50': !dragDisabled,
                    'text-base-content/10': dragDisabled,
                  }"
                />
              </div>
              <div class="cursor-pointer" @click="toggleTaskCompleted(task.id)">
                <IconSquareRounded stroke="1.5" v-if="!task.completed" class="" />
                <IconSquareRoundedCheck stroke="1.5" v-else />
              </div>
              <span :for="`task_${task.id}`" class="grow font-semibold">{{ task.name }}</span>
              <span class="inline-flex gap-1">
                <span
                  v-for="tag in task.tags"
                  :key="tag"
                  class="badge badge-xs"
                  :style="`--badge-fg: var(--color-white); --badge-color: var(--color-${getTagColor(tag)})`"
                  >{{ getTagName(tag) }}</span
                >
              </span>
              <span v-if="task.date" class="text-sm">
                {{
                  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' }).format(
                    new Date(task.date),
                  )
                }}
              </span>
            </div>
          </VueDraggable>
        </section>
      </template>
    </div>
  </main>

  <ContextMenu :menu="menu">
    <template v-if="activeMenuItem.type === 'task' && activeMenuItem.id">
      <li v-if="activeMenuItem.open">
        <button @click="handleToggleTaskCompleted">
          <IconSquareRoundedCheck class="size-4" /> Cocher
        </button>
      </li>
      <li v-else>
        <button @click="handleToggleTaskCompleted">
          <IconSquareRounded class="size-4" /> Décocher
        </button>
      </li>
      <li>
        <button class="text-warning"><IconPencil class="size-4" /> Modifier</button>
      </li>
      <li>
        <button @click="handleDuplicateTask"><IconCopy class="size-4" /> Dupliquer</button>
      </li>
      <li>
        <button @click="handleRemoveTask"><IconTrash class="size-4" /> Supprimer</button>
      </li>
    </template>
    <template v-if="activeMenuItem.type === 'category' && activeMenuItem.id">
      <li>
        <button class="text-warning"><IconSquareRoundedCheck class="size-4" /> Tout cocher</button>
      </li>
      <li>
        <button class="text-warning"><IconSquareRounded class="size-4" /> Tout décocher</button>
      </li>
      <li>
        <button class="text-warning" :disabled="activeMenuItem.id === UNCATEGORIZED">
          <IconPencil class="size-4" />
          Modifier
        </button>
      </li>
      <li>
        <button
          :disabled="activeMenuItem.id === UNCATEGORIZED || categories[0]?.id === activeMenuItem.id"
          @click="handleMoveCategory(-1)"
        >
          <IconArrowUp class="size-4" />
          Déplacer
        </button>
      </li>
      <li>
        <button
          :disabled="
            activeMenuItem.id === UNCATEGORIZED || categories.at(-1)?.id === activeMenuItem.id
          "
          @click="handleMoveCategory(1)"
        >
          <IconArrowDown class="size-4" /> Déplacer
        </button>
      </li>
      <li>
        <button :disabled="activeMenuItem.id === UNCATEGORIZED" @click="handleRemoveCategory">
          <IconTrash class="size-4" /> Supprimer
        </button>
      </li>
    </template>
    <li class="separator -mx-2"></li>
    <li class="text-[0.65rem] font-semibold text-base-content/50">
      <button class="uppercase">{{ activeMenuItem.type }}: {{ activeMenuItem.id }}</button>
    </li>
  </ContextMenu>
</template>
