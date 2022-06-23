<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar v-if="isAuthenticated">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
        />

        <q-toolbar-title>
          Detenciones {{ usr.getUsuario.rol }} {{ usr.getUsuario.sala }}
        </q-toolbar-title>
        <q-btn
          color="negative"
          icon="ion-log-out"
          label="salir"
          @click="logout"
          align="left"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="200"
      :breakpoint="500"
      v-if="isAuthenticated"
    >
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item active clickable v-ripple to="/estado-alambiques">
            <q-item-section avatar>
              <q-icon name="ion-book" />
            </q-item-section>

            <q-item-section> Estado de Alambiques </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/ingresar-detenciones"
            v-if="usr.getUsuario.rol === 'destilador'"
          >
            <q-item-section avatar>
              <q-icon name="ion-hand" color="negative" />
            </q-item-section>

            <q-item-section class="text-negative">
              Ingresar Detenciones
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/validar-detenciones"
            v-if="usr.getUsuario.rol === 'administrador'"
          >
            <q-item-section avatar>
              <q-icon name="ion-checkmark-circle" color="positive" />
            </q-item-section>

            <q-item-section class="text-positive">
              Validar Detenciones
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/reportes-detenciones"
            v-if="usr.getUsuario.rol === 'administrador'"
          >
            <q-item-section avatar>
              <q-icon name="ion-bookmarks" color="warning" />
            </q-item-section>

            <q-item-section class="text-warning">
              Reportes Detenciones
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import { auth } from "src/boot/firebase";
import { signOut } from "@firebase/auth";
import { useAuth } from "@vueuse/firebase/useAuth";
import { useUsuarios } from "src/stores/useUsuarios";
import { useRouter } from "vue-router";
const { isAuthenticated } = useAuth(auth);

export default defineComponent({
  name: "MainLayout",

  setup() {
    const router = useRouter();
    const usr = useUsuarios();

    const logout = () => {
      signOut(auth)
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          // An error happened.
        });
      localStorage.removeItem("usuario");
      usr.resetUsuario();
      router.push("/");
    };

    return {
      logout,
      isAuthenticated,

      usr,
      drawer: ref(false),
    };
  },
});
</script>
