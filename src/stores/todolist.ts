import type { Category, Tag, Task } from '@/types/todolist';
import Fuse from 'fuse.js';
import { defineStore } from 'pinia';

export const UNCATEGORIZED = 'none';

const defaultCategories: Category[] = [];

export const useTodolistStore = defineStore('todolist', {
  state: () => ({
    tasks: <Task[]>[],
    categories: <Category[]>[],
    tags: <Tag[]>[],
    layout: <Record<string, string[]>>{ [UNCATEGORIZED]: [] },
    search: <string>'',
    tagFilter: <string | null>null,
  }),
  getters: {
    fuse(): Fuse<Task> {
      return new Fuse(this.allTasks, {
        keys: ['name'],
        threshold: 0.35,
        ignoreLocation: true,
        ignoreDiacritics: true,
      });
    },
    allTasks: (state): Task[] => {
      return state.tasks.map((task: Task) => ({ ...task }));
    },
    tasksById(): Map<string, Task> {
      return new Map(this.allTasks.map((task) => [task.id, task]));
    },
    tasksFiltered(): Task[] {
      const q = this.search.trim();
      const results = q ? this.fuse.search(q).map((r) => r.item) : this.allTasks;
      return results.filter((t) => !this.tagFilter || t.tags?.includes(this.tagFilter));
    },
    filteredIds(): Set<string> {
      return new Set(this.tasksFiltered.map((t) => t.id));
    },
    tasksCompleted(): Task[] {
      return this.allTasks.filter((task) => task.completed);
    },
    categoryOf:
      (state) =>
      (taskId: string): string =>
        Object.keys(state.layout).find((key) => state.layout[key]?.includes(taskId)) ??
        UNCATEGORIZED,
  },
  actions: {
    syncLayout() {
      for (const category of defaultCategories) {
        if (!this.categories.some((c) => c.id === category.id)) {
          this.categories.push({ ...category });
        }
      }

      const valid = new Set(this.allTasks.map((task) => task.id));
      const placed = new Set<string>();

      for (const key of [UNCATEGORIZED, ...this.categories.map((c) => c.id)]) {
        this.layout[key] = (this.layout[key] ?? []).filter((id) => {
          if (!valid.has(id) || placed.has(id)) {
            return false;
          }
          placed.add(id);
          return true;
        });
      }

      for (const id of valid) {
        if (!placed.has(id)) {
          this.layout[UNCATEGORIZED]?.push(id);
        }
      }
    },
    addCategory(title: string) {
      const clean = title.trim();
      if (!clean) {
        return;
      }

      const key = (Math.random() + 1).toString(36).substring(5);
      this.categories.push({ id: key, name: clean, collapsed: false });
      this.layout[key] = [];
    },
    updateCategory(category: Category) {
      if (!category.name) {
        throw new Error('Le nom est obligatoire');
      }
      const existing = this.categories.find((c) => c.id === category.id);
      if (existing) {
        Object.assign(existing, category);
      }

      this.syncLayout();

      return true;
    },
    removeCategory(categoryId: string) {
      const idx = this.categories.findIndex((c) => c.id === categoryId);
      if (idx < 0) {
        return;
      }

      this.layout[UNCATEGORIZED]?.push(...(this.layout[categoryId] ?? []));
      delete this.layout[categoryId];
      this.categories.splice(idx, 1);
    },
    toggleCategoryCollapsed(categoryId: string) {
      const category = this.categories.find((c) => c.id == categoryId);
      if (category) {
        category.collapsed = !category.collapsed;
      }
    },
    moveCategory(categoryId: string, direction: -1 | 1) {
      const from = this.categories.findIndex((c) => c.id === categoryId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= this.categories.length) {
        return;
      }

      const [category] = this.categories.splice(from, 1);
      this.categories.splice(to, 0, category!);
    },
    moveTaskToCategory(taskId: string, categoryId: string) {
      for (const ids of Object.values(this.layout)) {
        const idx = ids.indexOf(taskId);
        if (idx >= 0) {
          ids.splice(idx, 1);
        }
      }
      (this.layout[categoryId] ?? this.layout[UNCATEGORIZED])?.push(taskId);
    },
    addTask(task: Task, categoryId: string = UNCATEGORIZED) {
      if (!task.name || task.name.length < 1) {
        throw new Error('Le titre est obligatoire');
      }

      this.tasks.push(task);
      (this.layout[categoryId] ?? this.layout[UNCATEGORIZED])?.push(task.id);
      this.syncLayout();

      return true;
    },
    updateTask(task: Task, categoryId: string = UNCATEGORIZED) {
      if (!task.name) {
        throw new Error('Le titre est obligatoire');
      }
      const existing = this.tasks.find((t) => t.id === task.id);
      if (existing) {
        Object.assign(existing, task);
      }

      if (categoryId !== this.categoryOf(task.id)) {
        this.moveTaskToCategory(task.id, categoryId);
      }
      this.syncLayout();

      return true;
    },
    removeTask(taskId: string) {
      if (typeof taskId === 'number') {
        return;
      }

      const idx = this.tasks.findIndex((task: Task) => task.id === taskId);
      if (idx >= 0) {
        this.tasks.splice(idx, 1);
        this.syncLayout();
      }
    },
    duplicateTask(taskId: string) {
      if (!taskId) {
        return;
      }
      const task = this.tasks.find((task: Task) => task.id === taskId);
      if (task) {
        const key = (Math.random() + 1).toString(36).substring(5);
        this.tasks.push({ ...task, id: key });

        const category = Object.keys(this.layout).find((key) => this.layout[key]?.includes(taskId));
        if (category) {
          this.layout[category]?.push(key);
        }
        this.syncLayout();
      }
    },
    toggleTaskCompleted(taskId: number | string) {
      const task = this.tasks.find((t: Task) => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
      }
    },
    updateCategorieTasksCompleted(categoryId: string, checked: boolean) {
      const ids = new Set((this.layout[categoryId] ?? []).filter((id) => this.filteredIds.has(id)));
      for (const task of this.tasks) {
        if (ids.has(task.id)) {
          task.completed = checked;
        }
      }
    },
    resetTasksCompleted() {
      this.tasks = this.tasks.map((task) => ({ ...task, completed: false }));
    },
    addTag(name: string, color: string | null) {
      const clean = name.trim();
      if (!clean) {
        return;
      }

      const key = (Math.random() + 1).toString(36).substring(5);
      this.tags.push({ id: key, name: clean, color: color });
    },
  },
  persist: {
    pick: ['tasks', 'categories', 'layout', 'tags'],
  },
});
