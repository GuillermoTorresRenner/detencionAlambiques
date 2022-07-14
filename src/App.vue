<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useQuasar } from "quasar";
import { useUsuarios } from "./stores/useUsuarios";
import { auth } from "./boot/firebase";
import { useAuth } from "@vueuse/firebase/useAuth";
import { useRouter } from "vue-router";
import { signOut } from "firebase/auth";

const $q = useQuasar();
$q.dark.set(true);
const { isAuthenticated, user } = useAuth(auth);
const router = useRouter();

const usuario = useUsuarios();

onMounted(() => {
  if (localStorage.length > 0) {
    if (usuario.getUsuario.nombre === "") {
      usuario.setUsuario(JSON.parse(localStorage.getItem("usuario")));
      router.push("/bienvenida");
    }
  } else {
    router.push("/");
  }

  // signOut(auth)
  //   .then(() => {
  //     router.push("/");
  //   })
  //   .catch((error) => {
  //     // An error happened.
  //   });
});
</script>
