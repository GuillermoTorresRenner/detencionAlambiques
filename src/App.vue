<template>
  <router-view />
</template>

<script setup>
import { defineComponent, onMounted } from "vue";
import { uid, useQuasar } from "quasar";
import { useAlambiques } from "./stores/useAlambiques";
import { useUsuarios } from "./stores/useUsuarios";
import { auth, db } from "./boot/firebase";
import { onSnapshot, collection } from "@firebase/firestore";
import { useAuth } from "@vueuse/firebase/useAuth";
import { useRouter } from "vue-router";

const $q = useQuasar();
$q.dark.set(true);
const { isAuthenticated, user } = useAuth(auth);
const router = useRouter();

const usuario = useUsuarios();

onMounted(() => {
  if (usuario.getUsuario.nombre === "") {
    usuario.setUsuario(JSON.parse(localStorage.getItem("usuario")));
    if (usuario.getUsuario.rol == "destilador") {
      router.push("/estado-alambiques");
    } else {
      router.push("/validar-detenciones");
    }
  }
});
</script>
