<template>
  <div class="q-pa-md">
    <q-table
      grid
      title="Alambiques Monte Patria"
      :rows="alambiques.getAlambiques"
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
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import { useAlambiques } from "../stores/useAlambiques";
import { useUsuarios } from "src/stores/useUsuarios";
import { onMounted } from "vue";

const columns = [
  { name: "sala", label: "Sala", field: "sala" },
  { name: "nombre", label: "Nombre", field: "nombre", sortable: true },
  { name: "estado", label: "Estado", field: "estado" },
];

export default {
  setup() {
    const alambiques = useAlambiques();
    const usuario = useUsuarios();

    onMounted(() => {
      usuario.getUsuarioFromLocalStorage();
    });

    return {
      columns,
      alambiques,
      filter: ref(""),
      pag: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 49,
        // rowsNumber: xx if getting data from a server
      },
    };
  },
};
</script>
