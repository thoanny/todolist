<script setup lang="ts">
import { useTodolistStore } from '@/stores/todolist';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const todolistStore = useTodolistStore();
const { updateCategory } = todolistStore;
const { categories } = storeToRefs(todolistStore);

const editedCategory = ref();
const modal = ref();

const open = (categoryId: string) => {
  editedCategory.value = {
    ...categories.value.find((c) => c.id === categoryId),
  };
  modal.value?.showModal();
};

const submit = () => {
  updateCategory(editedCategory.value);
  modal.value?.close();
  editedCategory.value = undefined;
};

defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <dialog class="modal modal-top" ref="modal">
      <div class="modal-box max-w-sm mx-auto">
        <template v-if="editedCategory">
          <form @submit.prevent="submit">
            <fieldset class="fieldset">
              <label for="edit_task_name" class="label">Intitulé</label>
              <input
                id="edit_task_name"
                type="text"
                class="input w-full"
                v-model="editedCategory.name"
              />
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
