<script setup lang="ts">
import { logout, signIn, user } from '@/composables/useAuth';
import { gravatarUrl } from '@/utils/gravatar';
import { IconLogout, IconUser } from '@tabler/icons-vue';
import { ref, watch } from 'vue';

const dialog = ref<HTMLDialogElement>();
const email = ref<string>('');
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle');
const error = ref<string>('');
const avatar = ref<string>('');

const open = () => {
  status.value = 'idle';
  dialog.value?.showModal();
};

const submit = async () => {
  status.value = 'sending';
  try {
    await signIn(email.value.trim());
    status.value = 'sent';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur inconnue';
    status.value = 'error';
  }
};

watch(user, async (u) => (avatar.value = u?.email ? await gravatarUrl(u.email) : ''), {
  immediate: true,
});
</script>

<template>
  <div v-if="user" class="flex items-center gap-2">
    <button
      class="cursor-pointer"
      popovertarget="popover-user"
      style="anchor-name: --anchor-popover-user"
    >
      <div class="avatar avatar-online">
        <div class="mask mask-circle w-10">
          <img :src="avatar" alt="" v-if="avatar.length > 0" />
        </div>
      </div>
    </button>
    <ul
      class="dropdown dropdown-end menu rounded-box bg-base-100 border border-base-300 mt-1"
      popover
      id="popover-user"
      style="position-anchor: --anchor-popover-user"
    >
      <li class="text-xs text-base-content/50">
        <span class="flex flex-col items-start gap-0"
          >Vous êtes connecté·e en tant que&nbsp;: <strong>{{ user.email }}</strong></span
        >
      </li>
      <li>
        <button class="btn btn-error btn-sm" @click="logout">
          <IconLogout class="size-4" /> Déconnexion
        </button>
      </li>
    </ul>
  </div>
  <template v-else>
    <button class="btn btn-secondary lg:btn-circle" @click="open">
      <IconUser />
      <span class="lg:hidden">Se connecter</span>
    </button>

    <dialog ref="dialog" class="modal">
      <div class="modal-box">
        <p v-if="status === 'sent'">
          Lien envoyé à <strong>{{ email }}</strong
          >. Ouvrez-le sur cet appareil pour vous connecter.<br />Vous pouvez fermer cette fenêtre.
        </p>
        <form v-else class="flex flex-col gap-3" @submit.prevent="submit">
          <h3 class="font-bold text-lg">Se connecter</h3>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="Votre adresse e-mail"
            class="input w-full"
          />
          <p v-if="status === 'error'" class="text-error text-sm">{{ error }}</p>
          <button class="btn btn-primary" :disabled="status === 'sending'">
            Recevoir un lien de connexion
          </button>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Fermer</button></form>
    </dialog>
  </template>
</template>
