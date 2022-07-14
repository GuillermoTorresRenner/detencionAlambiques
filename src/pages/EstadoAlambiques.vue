<template>
  <!-- Tabla donde se muestran los alambiques correspondientes a la sala dnde trabaja el destilador -->
  <div class="q-pa-md">
    <q-table
      grid
      title="Alambiques Monte Patria"
      :rows="
        usuario.getUsuario.rol === 'destilador'
          ? alambiques.getAlambiques.filter(
              (a) => a.sala === usuario.getUsuario.sala
            )
          : alambiques.getAlambiques
      "
      :columns="columns"
      row-key="name"
      :filter="filter"
      no-data-label="Sin alambiques que mostrar"
      :pagination="pag"
    >
      <template v-slot:top-right>
        <q-input
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Search"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card
            :class="[
              props.row.estado === 'operativo'
                ? 'bg-green-10'
                : props.row.estado === 'detención programada'
                ? 'bg-warning'
                : 'bg-negative',
            ]"
          >
            <q-card-section
              :class="[
                'text-center',
                props.row.sala === 'sala 1'
                  ? 'bg-white text-dark'
                  : 'bg-grey text-white',
              ]"
            >
              <strong class="text-h7">{{ props.row.sala }}</strong>
              <br />
              <strong class="text-h6">{{ props.row.nombre }}</strong>
            </q-card-section>
            <q-separator />
            <q-card-section class="">
              <div class="text-h7 text-weight-bold text-center">
                Estado: {{ props.row.estado }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div
                class="text-h7 text-weight-bold text-center"
                v-if="props.row.causa || props.row.causa !== ''"
              >
                Causa: {{ props.row.causa }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div
                class="text-h7 text-weight-bold text-center"
                v-if="props.row.desde !== ''"
              >
                Desde: {{ props.row.desde }}
              </div>
            </q-card-section>
            <q-card-section class="row justify-center">
              <q-btn
                :color="props.row.estado !== 'operativo' ? 'green' : 'red'"
                :icon="props.row.estado !== 'operativo' ? 'ion-play' : 'stop'"
                @click="detencion(props.row)"
              />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>

  <!-- Dialogo de pantalla completa en el que se setean los datos para la detención de un alambique -->
  <CRUDdetencion
    v-model="mostrar"
    :titulo="
      usuario.getUsuario.sala.toUpperCase() +
      ' ' +
      usuario.getUsuario.nombre.toUpperCase()
    "
    :cerrarDialogo="cancelar"
  >
    <template #formuario>
      <q-form @submit.prevent="dialogo()" class="q-gutter-md">
        <div class="row justify-center">
          <h4 class="text-primary text-center">
            {{ alambiques.getAlambique.nombre }}
          </h4>
        </div>

        <div class="row justify-center">
          <q-select
            v-model="alambiques.getDetencion.causaDetencion"
            :options="[
              'detención programada',
              'fuga en serpentín',
              'retorno condensado',
              'falla en caldera',
              'falla en portalón',
              'fuga en válvula de vapor',
              'fuga en válvula de salida',
              'otro motivo',
            ]"
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
            v-model="alambiques.getDetencion.notas"
            type="text"
            label="Describa la nueva causa de detencion"
            class="col-12 col-sm-3"
            v-if="alambiques.getDetencion.causaDetencion === 'otro motivo'"
            lazy-rules="ondemand"
            :rules="[
              (val) =>
                (alambiques.getDetencion.causaDetencion === 'otro motivo' &&
                  val &&
                  val.length > 0) ||
                'Por favor escribe la causa de detención',
            ]"
          />
        </div>

        <div class="row justify-center q-mt-lg">
          <q-btn icon="ion-hand" type="submit" color="negative" />
        </div>
      </q-form>
    </template>

    <!-- Diálogo  confirmación detención -->

    <q-dialog persistent v-model="mostrarDialogo">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="ion-hand" color="negative" text-color="white" />
          <span class="q-ml-sm">holi</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="warning" @click="cancelar" />
          <q-btn flat label="Notificar" color="positive" @click="aceptar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </CRUDdetencion>
</template>

<script setup>
import { ref } from "vue";
import { useAlambiques } from "../stores/useAlambiques";
import { useUsuarios } from "src/stores/useUsuarios";
import { onMounted } from "vue";
import { collection, onSnapshot } from "@firebase/firestore";
import { db } from "src/boot/firebase";
import CRUDdetencion from "../components/CRUDdetencion.vue";
import {
  reportarDetencion,
  restablecer,
} from "../composables/reportarDetencion";
import { useQuasar } from "quasar";

const columns = [
  { name: "sala", label: "Sala", field: "sala" },
  { name: "nombre", label: "Nombre", field: "nombre", sortable: true },
  { name: "estado", label: "Estado", field: "estado" },
];
const $q = useQuasar();
const alambiques = useAlambiques();
const usuario = useUsuarios();
const mostrar = ref(false);
const filter = ref("");
const mostrarDialogo = ref(true);
const pag = {
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 49,
  // rowsNumber: xx if getting data from a server
};
function dialogo() {
  $q.notify({
    message: `Notificar detención de ${alambiques.getDetencion.alambique}?`,
    color: "purple",
    icon: "ion-warning",
    position: "top",
    actions: [
      {
        label: "Aceptar",
        color: "green",
        handler: () => {
          reportarDetencion();
          cancelar();
          $q.notify({
            message: "Notificación Exitosa",
            color: "green",
            icon: "ion-mail",
            position: "bottom",
          });
        },
      },
      {
        label: "Cancelar",
        color: "red",
        handler: () => {
          cancelar();
        },
      },
    ],
  });
}

function detencion(registro) {
  if (registro.estado !== "operativo") {
    $q.notify({
      message: `Restablecer Funcionamiento del ${registro.nombre}?`,
      color: "purple",
      icon: "ion-warning",
      position: "top",
      actions: [
        {
          label: "Aceptar",
          color: "green",
          handler: () => {
            restablecer(registro.nombre);

            //////////////////////////////
            cancelar();
            $q.notify({
              message: "Restablecimiento Exitoso",
              color: "green",
              icon: "check",
              position: "bottom",
            });
          },
        },
        {
          label: "Cancelar",
          color: "red",
          handler: () => {
            cancelar();
          },
        },
      ],
    });
  } else {
    mostrar.value = true;
    alambiques.setAlambique(registro);

    alambiques.getDetencion.alambique = registro.nombre;
  }
}
function cancelar() {
  mostrar.value = false;
  alambiques.resetDetencion();
  mostrarDialogo.value = false;
}

onMounted(() => {
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
});
</script>
