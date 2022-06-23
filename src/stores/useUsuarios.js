import { defineStore } from "pinia";
import { db } from "src/boot/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { LocalStorage } from "quasar";

export const useUsuarios = defineStore("usuarios", {
  state: () => ({
    usuario: { rol: "sin rol", email: "", sala: "" },
  }),
  getters: {
    getUsuario: (state) => state.usuario,
  },
  actions: {
    async findUsuario(e) {
      const q = query(collection(db, "usuarios"), where("email", "==", e));
      const u = await getDocs(q);
      u.forEach((element) => {
        this.usuario = element.data();
      });
      localStorage.setItem("usuario", JSON.stringify(this.usuario));
    },

    setUsuario(usr) {
      this.usuario = usr;
    },
    resetUsuario() {
      this.usuario.email = "";
      this.usuario.rol = "";
    },
    setUsuarioInLocalStorage() {
      localStorage.setItem("usuario", JSON.stringify(this.usuario));
    },
    getUsuarioFromLocalStorage() {
      this.usuario = JSON.parse(localStorage.getItem("usuario"));
    },
    removeUsuarioFromLocalStorage() {
      localStorage.removeItem("usuario");
    },
  },
});
