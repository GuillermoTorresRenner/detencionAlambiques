import { defineStore } from "pinia";
import { db } from "src/boot/firebase";
import { onSnapshot, collection, setDoc, doc } from "firebase/firestore";

export const useAlambiques = defineStore("alambiques", {
  state: () => ({
    alambique: {},
    alambiques: [],
    detencion: {
      alambique: "",
      aprobacionAdministrador: false,
      causaDetencion: "",
      destilador: "",
      duracionDetencion: 0,
      estado: "",
      fechaDetecion: "",
      fechaRestablecimiento: "",
      horaDetencion: "",
      horaRestablecimiento: "",
      id: "",
      momentoDetencion: 0,
      momentoRestablecimiento: 0,
      notas: "",
      sala: "",
    },
    detenciones: [],
  }),
  getters: {
    getAlambique: (state) => state.alambique,
    getAlambiques: (state) => state.alambiques,
    getDetencion: (state) => state.detencion,
    getDetenciones: (state) => state.detenciones,
    getDetencionesActivas: (state) =>
      state.detenciones.filter((d) => d.estado !== "operativo"),
    getDetencionesNoValidadas: (state) =>
      state.detenciones.filter((d) => d.aprobacionAdministrador === false),
  },
  actions: {
    //Acciones de alambiques
    findAlambiqueByNameAndStopIt(nombre, causa) {
      const a = this.alambiques.filter((alam) => alam.nombre === nombre);
      a.forEach((alam) => {
        this.alambique = alam;
      });
      const date = new Date();
      let d, m, y, h, min, s;
      d =
        date.getDate().toString().length > 1
          ? date.getDate().toString()
          : "0" + date.getDate();
      m =
        (date.getMonth() + 1).toString.length > 1
          ? (date.getMonth() + 1).toString()
          : "0" + (date.getMonth() + 1).toString();
      y = date.getFullYear();

      h =
        date.getHours().toString().length > 1
          ? date.getHours().toString()
          : "0" + date.getHours().toString();
      min =
        date.getMinutes().toString().length > 1
          ? date.getMinutes().toString()
          : "0" + date.getMinutes().toString();
      s =
        date.getSeconds().toString() > 1
          ? date.getSeconds().toString()
          : "0" + date.getSeconds().toString();

      const fechaDetecion = d + "/" + m + "/" + y;

      const horaDetencion = h + ":" + min + ":" + s;
      this.alambique.desde = fechaDetecion + " - " + horaDetencion;
      this.alambique.causa = causa;
      this.alambique.estado =
        causa === "detención programada"
          ? "detención programada"
          : "detención por falla";
    },

    addAlambique(alambique) {
      this.alambiques.push(alambique);
      this.alambiques.sort((a, b) => {
        if (a.numero > b.numero) {
          return 1;
        } else {
          return -1;
        }
      });
    },
    modifiedAlambique(alambiqueModificado) {
      this.alambiques = this.alambiques.filter(
        (a) => a.numero !== alambiqueModificado.numero
      );
      this.alambiques.push(alambiqueModificado);
      this.alambiques.sort((a, b) => {
        if (a.numero > b.numero) {
          return 1;
        } else {
          return -1;
        }
      });
    },
    setAlambique(alam) {
      this.alambique = alam;
    },

    //Acciones de detenciones
    addDetencion(detencion) {
      this.detenciones.push(detencion);
      this.detenciones.sort((a, b) => {
        if (a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      });
    },
    modifiedDetencion(detencionModificada) {
      this.detenciones = this.detenciones.filter(
        (a) => a.id !== detencionModificada.id
      );
      this.detenciones.push(detencionModificada);
      this.detenciones.sort((a, b) => {
        if (a.id > b.id) {
          return 1;
        } else {
          return -1;
        }
      });
    },

    setDetencion(det) {
      this.detencion = det;
    },

    findDetencionByIdAndStartIt(id) {
      const a = this.detenciones.filter((det) => det.id === id);
      a.forEach((d) => {
        this.detencion = d;
      });
      const date = new Date();
      this.detencion.estado = "operativo";

      let d, m, y, h, min, s;
      d =
        date.getDate().toString().length > 1
          ? date.getDate().toString()
          : "0" + date.getDate();
      m =
        (date.getMonth() + 1).toString.length > 1
          ? (date.getMonth() + 1).toString()
          : "0" + (date.getMonth() + 1).toString();
      y = date.getFullYear();

      h =
        date.getHours().toString().length > 1
          ? date.getHours().toString()
          : "0" + date.getHours().toString();
      min =
        date.getMinutes().toString().length > 1
          ? date.getMinutes().toString()
          : "0" + date.getMinutes().toString();
      s =
        date.getSeconds().toString() > 1
          ? date.getSeconds().toString()
          : "0" + date.getSeconds().toString();

      this.detencion.fechaRestablecimiento = d + "/" + m + "/" + y;
      this.detencion.horaRestablecimiento = h + ":" + min + ":" + s;
      this.detencion.momentoRestablecimiento = date.getTime() / 3600000;
      //Cálculo de tiempo de detención
      this.detencion.duracionDetencion = (
        this.detencion.momentoRestablecimiento - this.detencion.momentoDetencion
      ).toFixed(1);
    },

    async validarDetencion(validacion) {
      this.detenciones = this.detenciones.filter(
        (d) => d.id !== this.detencion.id
      );
      this.detencion.aprobacionAdministrador = validacion;
      this.detenciones.push(this.detencion);
      await setDoc(doc(db, "detenciones", this.detencion.id), this.detencion);
    },
    resetDetencion() {
      this.detencion = {
        alambique: "",
        aprobacionAdministrador: false,
        causaDetencion: "",
        destilador: "",
        duracionDetencion: 0,
        estado: "",
        fechaDetecion: "",
        fechaRestablecimiento: "",
        horaDetencion: "",
        horaRestablecimiento: "",
        id: "",
        momentoDetencion: 0,
        momentoRestablecimiento: 0,
        notas: "",
        sala: "",
      };
    },

    findDetencionByNameAndStartIt(nombre) {
      this.getDetencionesActivas
        .filter((d) => d.alambique === nombre)
        .forEach((a) => {
          this.setDetencion(a);
        });
      const date = new Date();
      this.detencion.estado = "operativo";

      let d, m, y, h, min, s;
      d =
        date.getDate().toString().length > 1
          ? date.getDate().toString()
          : "0" + date.getDate();
      m =
        (date.getMonth() + 1).toString.length > 1
          ? (date.getMonth() + 1).toString()
          : "0" + (date.getMonth() + 1).toString();
      y = date.getFullYear();

      h =
        date.getHours().toString().length > 1
          ? date.getHours().toString()
          : "0" + date.getHours().toString();
      min =
        date.getMinutes().toString().length > 1
          ? date.getMinutes().toString()
          : "0" + date.getMinutes().toString();
      s =
        date.getSeconds().toString() > 1
          ? date.getSeconds().toString()
          : "0" + date.getSeconds().toString();

      this.detencion.fechaRestablecimiento = d + "/" + m + "/" + y;
      this.detencion.horaRestablecimiento = h + ":" + min + ":" + s;
      this.detencion.momentoRestablecimiento = date.getTime() / 3600000;
      //Cálculo de tiempo de detención
      this.detencion.duracionDetencion = (
        this.detencion.momentoRestablecimiento - this.detencion.momentoDetencion
      ).toFixed(1);
    },
  },
});
