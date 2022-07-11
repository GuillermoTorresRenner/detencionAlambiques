<template>
  <q-page>
    <q-table
      grid
      title="Alambiques Monte Patria"
      :rows="detenciones.getDetencionesNoValidadas"
      :columns="col"
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
              <strong class="text-h6">{{ props.row.alambique }}</strong>
            </q-card-section>
            <q-separator />
            <q-card-section class="">
              <div class="text-h7 text-weight-bold text-center">
                Estado: {{ props.row.estado }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-h7 text-weight-bold text-center">
                Causa de Detención: {{ props.row.causaDetencion }}
                {{ props.row.notas }}
              </div>
              <div class="text-h7 text-weight-bold text-center">
                Destilador {{ props.row.destilador }}
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-h7 text-weight-bold text-center">
                Desde: {{ props.row.fechaDetecion }} -
                {{ props.row.horaDetencion }}
              </div>
              <div class="text-h7 text-weight-bold text-center">
                Hasta: {{ props.row.fechaRestablecimiento }} -
                {{ props.row.horaRestablecimiento }}
              </div>
              <div class="text-h7 text-weight-bold text-center">
                Duración Detención: {{ props.row.duracionDetencion }} horas
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="text-h7 text-weight-bold text-center">
              {{
                props.row.aprobacionAdministrador === false
                  ? "Sin aprobación"
                  : "aprobado"
              }}
            </q-card-section>
            <q-card-section class="row justify-center">
              <q-btn color="green" icon="check" @click="validar(props.row)" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { useAlambiques } from "src/stores/useAlambiques";
import { useUsuarios } from "src/stores/useUsuarios";
import { onMounted, ref } from "vue";
import { db } from "src/boot/firebase";
import { onSnapshot, collection, doc, setDoc } from "@firebase/firestore";
import { useQuasar } from "quasar";

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
    name: "aprobacionAdministrador",
    label: "Aprobación Administrador",
    field: "aprobacionAdministrador",
    align: "center",
    sorteable: true,
  },
  {
    name: "validar",
    label: "Validar Detención",
    align: "center",
  },
];
const $q = useQuasar();
const detenciones = useAlambiques();
const usuario = useUsuarios();
const filter = ref("");
const pag = {
  sortBy: "desc",
  descending: false,
  page: 1,
  rowsPerPage: 49,
  // rowsNumber: xx if getting data from a server
};

function validar(registro) {
  console.log(registro);
  $q.notify({
    message: `VALIDACIÓN DE DETENCIÓN DE ${registro.alambique}`,
    caption: "Elija una de las siguientes opciones",
    color: "purple",
    icon: "ion-warning",
    position: "top",
    actions: [
      {
        label: "Conforme",
        color: "green",
        icon: "ion-happy",
        handler: async () => {
          registro.aprobacionAdministrador = "Validado Conforme";
          await setDoc(doc(db, "detenciones", registro.id), registro);
          $q.notify({
            message: "VALIDACIÓN EXITOSA",
            caption: "Registro modificado en la base de datos",
            color: "green",
            icon: "check",
            position: "bottom",
          });
        },
      },
      {
        label: "Disconforme",
        color: "warning",
        icon: "ion-sad",
        handler: async () => {
          registro.aprobacionAdministrador = "Validado Disconforme";
          await setDoc(doc(db, "detenciones", registro.id), registro);
          $q.notify({
            message: "VALIDACIÓN EXITOSA",
            caption: "Registro modificado en la base de datos",
            color: "green",
            icon: "check",
            position: "bottom",
          });
        },
      },
      {
        label: "Cancelar",
        color: "red",
        icon: "close",
        handler: () => {},
      },
    ],
  });
}

onMounted(() => {
  //Obtener data de alambiques en tiempo real
  onSnapshot(collection(db, "alambiques"), (cambios) => {
    cambios.docChanges().forEach((c) => {
      if (c.type === "added") {
        detenciones.addAlambique(c.doc.data());
      }
      if (c.type === "modified") {
        detenciones.modifiedAlambique(c.doc.data());
      }
    });
  });
  //Obtener data de detenciones en tiempo real

  onSnapshot(collection(db, "detenciones"), (cambios) => {
    cambios.docChanges().forEach((c) => {
      if (c.type === "added") {
        detenciones.addDetencion(c.doc.data());
      }
      if (c.type === "modified") {
        detenciones.modifiedDetencion(c.doc.data());
      }
    });
  });
});
</script>
