<template>
  <q-page>
    <div class="q-pa-md">
      <q-table
        title="Reportes Detenciones"
        :rows="rows"
        :columns="columns"
        color="primary"
        row-key="name"
        :filter="filter"
      >
        <template v-slot:top-right>
          <q-btn
            color="green"
            icon-right="archive"
            label="Exportar CSV"
            no-caps
            @click="exportTable"
          />
        </template>

        <template v-slot:top-left>
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
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { exportFile, useQuasar } from "quasar";
import { useAlambiques } from "src/stores/useAlambiques";
import { ref } from "vue";

const columns = [
  {
    name: "id",
    align: "center",
    label: "ID Detención",
    field: "id",
    sortable: true,
  },
  {
    name: "sala",
    align: "center",
    label: "Sala",
    field: "sala",
    sortable: true,
  },
  {
    name: "alambique",
    label: "Alambique ",
    field: "alambique",
    align: "center",
    sortable: true,
  },
  {
    name: "estado",
    label: "Estado Alambique",
    field: "estado",
    align: "center",
  },
  {
    name: "fechaDetencion",
    label: "Fecha Detención",
    field: "fechaDetecion",
    align: "center",
  },
  {
    name: "horaDetencion",
    label: "Hora Detención",
    field: "horaDetencion",
    align: "center",
  },
  {
    name: "causaDetencion",
    label: "Causa Detención",
    field: "causaDetencion",
    align: "center",
    sortable: true,
  },
  {
    name: "destilador",
    label: "Destilador",
    field: "destilador",
    align: "center",
    sortable: true,
  },
  {
    name: "fechaRestablecimiento",
    label: "Fecha Restablecimiento",
    field: "fechaRestablecimiento",
    align: "center",
    sortable: true,
  },
  {
    name: "horaRestablecimiento",
    label: "Hora Restablecimiento",
    field: "horaRestablecimiento",
    align: "center",
    sortable: true,
  },
  {
    name: "duracionDetencion",
    label: "Horas Detenido",
    field: "duracionDetencion",
    align: "center",
    sortable: true,
  },
  {
    name: "aprobacionAdministrador",
    label: "Validación Administrador",
    field: "aprobacionAdministrador",
    align: "center",
    sortable: true,
  },
];

const detenciones = useAlambiques();

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;

  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);

  formatted = formatted.split('"').join('""');
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`;
}

export default {
  setup() {
    const $q = useQuasar();
    const rows = ref(detenciones.getDetenciones);

    return {
      columns,
      detenciones,
      filter: ref(""),
      rows,

      exportTable() {
        // naive encoding to csv format
        const content = [columns.map((col) => wrapCsvValue(col.label))]
          .concat(
            rows.value.map((row) =>
              columns
                .map((col) =>
                  wrapCsvValue(
                    typeof col.field === "function"
                      ? col.field(row)
                      : row[col.field === void 0 ? col.name : col.field],
                    col.format,
                    row
                  )
                )
                .join(",")
            )
          )
          .join("\r\n");

        const status = exportFile(
          "Reporte Detenciones.csv",
          content,
          "text/csv"
        );

        if (status !== true) {
          $q.notify({
            message: "Browser denied file download...",
            color: "negative",
            icon: "warning",
          });
        }
      },
    };
  },
};
</script>
