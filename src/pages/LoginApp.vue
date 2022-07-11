<template>
  <q-page>
    <div class="container">
      <div class="row justify-end">
        <strong class="q-mt-md q-mr-xl text-overline">V 0.01</strong>
      </div>
      <div class="row justify-center"></div>
      <h4 class="text-center text-primary text-center">
        Detención de Alambiques CPCH
      </h4>
    </div>

    <h5 class="text-center text-primary">Login</h5>
    <q-form @submit="ingresar" class="q-gutter-md">
      <div class="row justify-center">
        <q-input
          v-model="usr"
          type="text"
          label="Usuario"
          class="col-10"
          lazy-rules="ondemand"
          :rules="[
            (val) => (val && val.length > 0) || 'Por favor escribe tu Email',
          ]"
        />
      </div>
      <div class="row justify-center">
        <q-input
          v-model="pass"
          type="password"
          label="Contraseña"
          class="col-10"
          lazy-rules="ondemand"
          :rules="[
            (val) =>
              (val && val.length > 0) || 'Por favor escribe tu Contraseña',
          ]"
        />
      </div>
      <div class="row justify-center">
        <p class="text-negative q-ml-xl justify-end" v-if="e">
          usuario o contraseña incorrectos
        </p>
      </div>
      <div class="row justify-center q-mt-xl">
        <q-btn label="Ingresar" type="submit" color="primary" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { defineComponent, ref, onMounted } from "vue";
import { db, auth } from "src/boot/firebase";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { useUsuarios } from "../stores/useUsuarios";
import { useRouter } from "vue-router";
import { useAuth } from "@vueuse/firebase/useAuth";
import { LocalStorage } from "quasar";

const { isAuthenticated, user } = useAuth(auth);

const usr = ref("");
const pass = ref("");
const usuario = useUsuarios();

let e = ref(false);
const router = useRouter();
const ingresar = async () => {
  try {
    await signInWithEmailAndPassword(auth, usr.value.toLowerCase(), pass.value)
      .then((userCredential) => {
        // Signed in
        const uid = userCredential.user.uid;
        usuario.findUsuario(uid);

        router.push("/estado-alambiques");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        e.value = true;
        pass.value = "";
      });
  } catch (error) {}
};
</script>
