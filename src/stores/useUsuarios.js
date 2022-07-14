import { defineStore } from "pinia";
import { query, where, collection, getDoc, doc } from "firebase/firestore";
import { db } from "src/boot/firebase";

export const useUsuarios = defineStore("usuario", {
  state: () => ({
    usuario: {
      rol: "",
      nombre: "",
      sala: "",
      email: "",
      password: "",
      uid: "",
    },
    usuarios: [],
  }),
  getters: {
    getUsuario: (state) => state.usuario,
    getUsuarios: (state) => state.usuarios,
  },
  actions: {
    async login(uid) {
      const q = await getDoc(doc(db, "usuarios", uid));
      this.usuario = q.data();
      localStorage.setItem("usuario", JSON.stringify(this.usuario));
    },

    setUsuario(usr) {
      this.usuario = usr;
    },
    addUsuario(usr) {
      this.usuarios.push(usr);
      this.usuarios.sort((a, b) => {
        if (a.nombre > b.nombre) {
          return 1;
        } else {
          return -1;
        }
      });
    },
    removeUsuario(uid) {
      this.usuarios = this.usuarios.filter((u) => u.uid !== uid);
    },
  },
});
