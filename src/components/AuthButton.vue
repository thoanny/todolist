<script setup lang="ts">
import {
  logout,
  recovering,
  resetPassword,
  setNewPassword,
  signIn,
  signUp,
  user,
} from '@/composables/useAuth';
import { gravatarUrl } from '@/utils/gravatar';
import { IconLogout, IconUser } from '@tabler/icons-vue';
import { ref, watch } from 'vue';

type Mode = 'login' | 'signup' | 'reset' | 'recovery';

const dialog = ref<HTMLDialogElement>();
const mode = ref<Mode>('login');
const email = ref<string>('');
const password = ref<string>('');
const message = ref<string>('');
const error = ref<string>('');
const busy = ref<boolean>(false);

const avatar = ref<string>('');

const open = (m: Mode = 'login') => {
  mode.value = m;
  message.value = error.value = '';
  dialog.value?.showModal();
};

watch(recovering, (v) => v && open('recovery'));

const submit = async () => {
  busy.value = true;
  error.value = message.value = '';

  try {
    if (mode.value === 'login') {
      await signIn(email.value.trim(), password.value);
      dialog.value?.close();
    } else if (mode.value === 'signup') {
      const logged = await signUp(email.value.trim(), password.value);
      if (logged) dialog.value?.close();
      else message.value = 'Compte créé : confirmez votre adresse via le lien reçu par e-mail.';
    } else if (mode.value === 'reset') {
      await resetPassword(email.value.trim());
      message.value = 'Si un compte existe, un lien de réinitialisation vient de vous être envoyé.';
    } else {
      await setNewPassword(password.value);
      dialog.value?.close();
    }
    password.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur inconnue';
  } finally {
    busy.value = false;
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
        <span class="flex flex-col items-start gap-0 whitespace-nowrap"
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
    <button class="btn btn-secondary lg:btn-circle" @click="open('login')">
      <IconUser />
      <span class="lg:hidden">Se connecter</span>
    </button>

    <dialog ref="dialog" class="modal">
      <div class="modal-box">
        <form class="flex flex-col gap-3" @submit.prevent="submit">
          <h3 class="font-bold text-lg">
            {{
              {
                login: 'Connexion',
                signup: 'Créer un compte',
                reset: 'Mot de passe oublié',
                recovery: 'Nouveau mot de passe',
              }[mode]
            }}
          </h3>
          <input
            v-if="mode !== 'recovery'"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="Votre adresse e-mail"
            class="input w-full"
          />
          <input
            v-if="mode !== 'reset'"
            v-model="password"
            type="password"
            required
            minlength="12"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            placeholder="Mot de passe"
            class="input w-full"
          />

          <p v-if="error" class="text-error text-sm">{{ error }}</p>
          <p v-if="message" class="text-sm">{{ message }}</p>

          <button class="btn btn-primary" :disabled="busy">
            {{
              {
                login: 'Se connecter',
                signup: "S'inscrire",
                reset: 'Réinitialiser le mot de passe',
                recovery: 'Enregistrer le mot de passe',
              }[mode]
            }}
          </button>

          <div class="flex justify-between gap-2">
            <button type="button" v-if="mode === 'login'" class="link" @click="open('signup')">
              Créer un compte
            </button>
            <button
              type="button"
              v-else-if="mode !== 'recovery'"
              class="link"
              @click="open('login')"
            >
              J'ai déjà un compte
            </button>
            <button type="button" v-if="mode === 'login'" class="link" @click="open('reset')">
              Mot de passe oublié&nbsp;?
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Fermer</button></form>
    </dialog>
  </template>
</template>
