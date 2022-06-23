<template>
  <router-view />
</template>

<script>
import { defineComponent, onBeforeMount, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useAlambiques } from "./stores/useAlambiques";
import { useUsuarios } from "./stores/useUsuarios";
import { db } from "./boot/firebase";
import { onSnapshot, collection } from "@firebase/firestore";
export default defineComponent({
  name: "App",
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    const alambiques = useAlambiques();

    //Obtener data de alambiques en tiempo real
    onSnapshot(collection(db, "alambiques"), (cambios) => {
      cambios.docChanges().forEach((c) => {
        if (c.type === "added") {
          alambiques.addAlambique(c.doc.data());
        }
        if (c.type === "modified") {
          alambiques.modifiedAlambique(c.doc.data());
        }
      });
    });
    //Obtener data de detenciones en tiempo real

    onSnapshot(collection(db, "detenciones"), (cambios) => {
      cambios.docChanges().forEach((c) => {
        if (c.type === "added") {
          alambiques.addDetencion(c.doc.data());
        }
        if (c.type === "modified") {
          alambiques.modifiedDetencion(c.doc.data());
        }
      });
    });

    const usuario = useUsuarios();
    onMounted(() => {
      if (localStorage.getItem("usuario")) {
        usuario.setUsuario(JSON.parse(localStorage.getItem("usuario")));
      }
    });
  },
});
</script>
