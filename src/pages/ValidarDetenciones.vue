<template>
  <q-page>
    <div class="container">
      <div class="row justify-center">
        <h4 class="text-positive">Validación Detenciones</h4>
      </div>
      <!-- Tabla de alambiques Detenidos -->
      <q-table
        title="Vaidaciones Pendientes"
        :rows="detenciones.getDetencionesNoValidadas"
        :columns="col"
        row-key="name"
        class="q-mt-xl"
        no-data-label="Sin validaciones pendientes"
      >
        <template v-slot:body-cell-validar="props">
          <q-td :props="props">
            <div>
              <q-btn
                color="positive"
                icon="ion-checkmark"
                label=""
                @click="confirmar(props.row)"
              />
            </div>
            <div class="my-table-details">
              {{ props.row.details }}
            </div>
          </q-td>
        </template>
      </q-table>
      <!-- Dialogo de Validación-->
      <q-dialog v-model="confirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar
              icon="ion-checkmark"
              color="positive"
              text-color="white"
            />
            <span class="q-ml-sm"
              >Validar detención de
              {{ detenciones.getDetencion.alambique }} ?</span
            >
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="No validar"
              color="white"
              @click="confirm = false"
            />
            <q-btn
              flat
              label="Validar Conforme"
              color="positive"
              @click="validacion('validación conforme')"
            />
            <q-btn
              flat
              label="Validar Disconforme"
              color="negative"
              @click="validacion('validación disconforme')"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import { useAlambiques } from "src/stores/useAlambiques";
import { useUsuarios } from "src/stores/useUsuarios";
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  setup() {
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

    const detenciones = useAlambiques();
    const confirm = ref(false);
    const usuario = useUsuarios();
    const confirmar = (det) => {
      detenciones.setDetencion(det);
      console.log(detenciones.getDetencion);
      confirm.value = true;
    };
    const validacion = async (tipoValidacion) => {
      detenciones.validarDetencion(tipoValidacion);

      confirm.value = false;
    };

    onMounted(() => {
      usuario.getUsuarioFromLocalStorage();
    });

    return {
      detenciones,
      col,
      confirm,
      confirmar,
      validacion,
    };
  },
});
</script>
