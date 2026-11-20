<script setup lang="ts">
import { UNCATEGORIZED, useTodolistStore } from '@/stores/todolist';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const todolistStore = useTodolistStore();
const { categoryOf, updateTask } = todolistStore;
const { tasks, tags, categories } = storeToRefs(todolistStore);

const editedTask = ref();
const modal = ref();

const open = (taskId: string) => {
  editedTask.value = {
    ...tasks.value.find((t) => t.id === taskId),
    category: categoryOf(taskId),
  };
  modal.value?.showModal();
};

const submit = () => {
  const category = editedTask.value.category;
  const task = editedTask.value;
  delete task.category;
  updateTask(task, category);
  modal.value?.close();
  editedTask.value = undefined;
};

defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <dialog class="modal modal-top" ref="modal">
      <div class="modal-box max-w-sm mx-auto">
        <template v-if="editedTask">
          <form @submit.prevent="submit">
            <fieldset class="fieldset">
              <label for="edit_task_name" class="label">Intitulé</label>
              <input
                id="edit_task_name"
                type="text"
                class="input w-full"
                v-model="editedTask.name"
              />
            </fieldset>
            <fieldset class="fieldset">
              <label for="edit_task_date" class="label">Date</label>
              <input
                id="edit_task_date"
                type="date"
                class="input w-full"
                v-model="editedTask.date"
              />
            </fieldset>
            <fieldset class="fieldset">
              <label for="edit_task_category" class="label">Catégorie</label>
              <select id="edit_task_category" class="select w-full" v-model="editedTask.category">
                <option
                  :value="UNCATEGORIZED"
                  :selected="UNCATEGORIZED === categoryOf(editedTask.id)"
                >
                  Sans catégorie
                </option>
                <option
                  :value="c.id"
                  v-for="c in categories"
                  :key="c.id"
                  :selected="c.id === editedTask.category"
                >
                  {{ c.name }}
                </option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <div class="label">Étiquettes</div>
              <label
                v-for="tag in tags"
                :key="tag.id"
                class="text-sm inline-flex items-center gap-1"
                :for="`edit_task_tag_${tag.id}`"
              >
                <input
                  :id="`edit_task_tag_${tag.id}`"
                  type="checkbox"
                  class="toggle toggle-xs toggle-secondary"
                  v-model="editedTask.tags"
                  :value="tag.id"
                />
                {{ tag.name }}
              </label>
            </fieldset>
            <button class="btn btn-primary btn-block mt-2">Enregistrer</button>
          </form>
        </template>

        <form method="dialog">
          <button class="btn mt-2 btn-block">Annuler</button>
        </form>
      </div>
    </dialog>
  </Teleport>
</template>
