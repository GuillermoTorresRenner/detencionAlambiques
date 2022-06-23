<template>
  <q-page padding>
    <div class="container">
      <div class="row justyfy-center">
        <h4 class="text-primary text-center col-12">
          Ingreso de Detenciones de Alambiques
        </h4>
      </div>
      <q-form @submit.prevent="confirmar" class="q-gutter-md">
        <div class="row justify-center">
          <q-input
            v-model="detencion.destilador"
            type="text"
            label="nombre y apellido del destilador"
            class="col-12 col-sm-5"
            lazy-rules="ondemand"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Por favor escribe tu nombre y apellido',
            ]"
          />
        </div>

        <div class="row justify-center">
          <q-select
            v-model="detencion.alambique"
            :options="getAlambiques"
            label="alambiques"
            filled
            class="col-12 col-sm-3 q-mr-md"
            lazy-rules="ondemand"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Por favor Selecciona tu sala de destilación y alambique detenido',
            ]"
          />
          <q-select
            v-model="detencion.causaDetencion"
            :options="opcionesCausas"
            label="Causas Detención"
            filled
            class="col-12 col-sm-3 q-mr-md"
            lazy-rules="ondemand"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Por favor seecciona la causa de detención',
            ]"
          />
          <q-input
            v-model="detencion.notas"
            type="text"
            label="Describa la nueva causa de detencion"
            class="col-12 col-sm-3"
            v-if="detencion.causaDetencion === 'otro motivo'"
            lazy-rules="ondemand"
            :rules="[
              (val) =>
                (detencion.causaDetencion === 'otro motivo' &&
                  val &&
                  val.length > 0) ||
                'Por favor escribe la causa de detención',
            ]"
          />
        </div>

        <div class="row justify-center q-mt-lg">
          <q-btn
            label="Agregar Detención"
            icon="ion-add"
            type="submit"
            color="negative"
          />
        </div>
        <!-- Dialogo de confirmación -->
        <q-dialog v-model="confirm" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="ion-hand" color="negative" text-color="white" />
              <span class="q-ml-sm"
                >Notificar detención de {{ detencion.alambique }} ?</span
              >
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancelar"
                color="warning"
                @click="cancelarReporte"
              />
              <q-btn
                flat
                label="Notificar"
                color="positive"
                @click="reportar"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialogo de confirmación restablecimiento-->
        <q-dialog v-model="confirm2" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="ion-play" color="positive" text-color="white" />
              <span class="q-ml-sm"
                >Restablecer funcionamiento de
                {{ alambiques.getDetencion.alambique }} ?</span
              >
            </q-card-section>

            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancelar"
                color="warning"
                @click="confirm2 = false"
              />
              <q-btn
                flat
                label="Restablecer"
                color="positive"
                @click="restablecerFuncionamiento"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialogo de Alerta -->
        <q-dialog v-model="alert" persistent>
          <q-card>
            <q-card-section>
              <div class="text-h6">Confiramación</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              Se ha notificado satisfactoriamente de la Detención del
              {{ detencion.alambique }}
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="OK" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-form>

      <!-- Tabla de alambiques Detenidos -->
      <q-table
        title="Alambiques Detenidos"
        :rows="alambiques.getDetencionesActivas"
        :columns="col"
        row-key="name"
        class="q-mt-xl"
        no-data-label="Sin Alambiques Detenidos"
        :dense="$q.screen.lt.md"
      >
        <template v-slot:body-cell-restablecer="props">
          <q-td :props="props">
            <div>
              <q-btn
                color="positive"
                icon="ion-play"
                label=""
                @click="restablecer(props.row)"
              />
            </div>
            <div class="my-table-details">
              {{ props.row.details }}
            </div>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>
<script>
import { ref, computed, onMounted } from "vue";
import { useAlambiques } from "src/stores/useAlambiques";
import { doc, setDoc } from "@firebase/firestore";
import { db } from "src/boot/firebase";
import { useUsuarios } from "src/stores/useUsuarios";

export default {
  setup() {
    const detencion = ref({
      aprobacionAdministrador: false,
      causaDetencion: "",
      destilador: "",
      fechaDetecion: "",
      fechaRestablecimiento: "",
      horaDetencion: "",
      horaRestablecimiento: "",
      notas: "",
      sala: "",
      alambique: "",
      id: "",
      estado: "detenido",
      momentoDetencion: 0,
      momentoRestablecimiento: 0,
      duracionDetencion: 0,
    });
    const col = [
      {
        name: "id",
        label: "ID",
        field: "id",
        align: "center",
        sorteable: true,
      },
      {
        name: "sala",
        label: "Sala",
        field: "sala",
        align: "center",
        sorteable: true,
      },
      {
        name: "alambique",
        label: "Alambique",
        field: "alambique",
        align: "center",
        sorteable: true,
      },
      {
        name: "fechaDetecion",
        label: "Fecha Detención",
        field: "fechaDetecion",
        align: "center",
        sorteable: true,
      },
      {
        name: "horaDetencion",
        label: "Hora Detencion",
        field: "horaDetencion",
        align: "center",
        sorteable: true,
      },
      {
        name: "causaDetencion",
        label: "Causa Detencion",
        field: "causaDetencion",
        align: "center",
        sorteable: true,
      },
      {
        name: "estado",
        label: "Estado",
        field: "estado",
        align: "center",
        sorteable: true,
      },
      {
        name: "restablecer",
        label: "Restablecer Alambique",
        field: "restablecer",
        align: "center",
      },
    ];
    const alambiques = useAlambiques();
    const confirm = ref(false);
    const alert = ref(false);
    const opcionesCausas = [
      "detención programada",
      "fuga en serpentín",
      "retorno condensado",
      "falla en caldera",
      "fuga en válvula de vapor",
      "fuga en válvula de salida",
      "otro motivo",
    ];
    const confirm2 = ref(false);
    const usuario = useUsuarios();

    //Métodos

    const getAlambiques = computed(() => {
      let lista = [];
      const a = alambiques.getAlambiques;
      a.forEach((i) => {
        if (i.sala === usuario.getUsuario.sala) {
          lista.push(i.nombre);
        }
      });
      return lista;
    });
    const cancelarReporte = () => {
      detencion.value.sala = "";
      detencion.value.alambique = "";
      detencion.value.causaDetencion = "";
      detencion.value.notas = "";
      detencion.value.destilador = "";
      confirm.value = false;
    };
    const confirmar = () => {
      confirm.value = true;
    };
    const reportar = async () => {
      //guardar datos en DB
      detencion.value.sala = usuario.getUsuario.sala;
      const date = new Date();
      let d, m, a, h, min, s;
      d =
        date.getDate().toString().length > 1
          ? date.getDate().toString()
          : "0" + date.getDate();
      m =
        (date.getMonth() + 1).toString.length > 1
          ? (date.getMonth() + 1).toString()
          : "0" + (date.getMonth() + 1).toString();
      a = date.getFullYear();
      detencion.value.fechaDetecion = d + "/" + m + "/" + a;
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
      detencion.value.horaDetencion = h + ":" + min + ":" + s;
      detencion.value.id =
        "F" +
        d +
        m +
        a +
        "H" +
        h +
        min +
        s +
        "S" +
        detencion.value.sala.substring(5, 7) +
        "A" +
        detencion.value.alambique.substring(10, 12);
      detencion.value.momentoDetencion = date.getTime() / 3600000;
      detencion.value.estado =
        detencion.value.causaDetencion === "detención programada"
          ? "detención programada"
          : "detención por falla";
      alambiques.findAlambiqueByNameAndStopIt(
        detencion.value.alambique,
        detencion.value.causaDetencion
      );
      //Guardado en colección detenciones, daatos tomados desde el objeto detenciones de esta vista.
      await setDoc(doc(db, "detenciones", detencion.value.id), detencion.value);
      //Guardado en colección alambiques, datos tomados desde store y modificados con findAlambiqueByNameAndStopIt
      await setDoc(
        doc(db, "alambiques", alambiques.getAlambique.numero),
        alambiques.getAlambique
      );
      if (detencion.value.causaDetencion !== "detención programada") {
        //Enviar correo
        emailjs
          .send(
            "service_l5hg039",
            "template_u5hv00r",
            detencion.value,
            "jziiXN-P-NsRg8J7J"
          )
          .then(
            function (response) {
              console.log("SUCCESS!", response.status, response.text);
            },
            function (error) {
              console.log("FAILED...", error);
            }
          );
      }

      //Mostrar dialogo confirmación
      confirm.value = false;
      alert.value = true;
      cancelarReporte();
    };

    const restablecer = (data) => {
      alambiques.findDetencionByIdAndStartIt(data.id);
      confirm2.value = true;
    };

    const restablecerFuncionamiento = async () => {
      alambiques.findAlambiqueByNameAndStartIt(
        alambiques.getDetencion.alambique
      );
      await setDoc(
        doc(db, "detenciones", alambiques.getDetencion.id),
        alambiques.getDetencion
      );
      await setDoc(
        doc(db, "alambiques", alambiques.getAlambique.numero),
        alambiques.getAlambique
      );

      confirm2.value = false;
    };
    onMounted(() => {
      usuario.getUsuarioFromLocalStorage();
    });

    return {
      detencion,
      getAlambiques,
      opcionesCausas,
      confirm,
      alert,
      reportar,
      confirmar,
      cancelarReporte,
      alambiques,
      col,
      restablecer,
      confirm2,
      restablecerFuncionamiento,
    };
  },
};
</script>
