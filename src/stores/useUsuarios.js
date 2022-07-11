import { defineStore } from "pinia";
import { query, where, collection, getDoc, doc } from "firebase/firestore";
import { db } from "src/boot/firebase";

export const useUsuarios = defineStore("usuario", {
  state: () => ({
    usuario: { rol: "", nombre: "", sala: "" },
    usuarios: [],
  }),
  getters: {
    getUsuario: (state) => state.usuario,
    getUsuarios: (state) => state.usuarios,
  },
  actions: {
    async findUsuario(uid) {
      const q = await getDoc(doc(db, "usuarios", uid));
      this.usuario = q.data();
      localStorage.setItem("usuario", JSON.stringify(this.usuario));
    },

    setUsuario(usr) {
      this.usuario = usr;
    },
  },
});
