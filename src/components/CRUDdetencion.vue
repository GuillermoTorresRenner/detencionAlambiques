<template>
  <q-dialog
    persistent
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="bg-dark text-white">
      <q-card-section>
        <div class="text-h5 text-info text-center">{{ titulo }}</div>
        <div class="row justify-center">
          <q-btn
            icon="ion-arrow-dropdown-circle"
            color="grey"
            flat
            class="col"
            @click="cerrarDialogo()"
            size="xl"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <slot name="formuario" />
      </q-card-section>

      <!-- <q-page-sticky position="bottom-right" :offset="[18, 18]" expand>
        <q-fab
          color="accent"
          push
          icon="ion-arrow-dropup"
          direction="up"
          dense
          size="xs"
          class="q-ml-md"
        >
          <q-fab-action color="negative" @click="onClick" icon="ion-trash" />
          <q-fab-action color="warning" @click="onClick" icon="ion-create" />
          <q-fab-action color="grey" v-close-popup icon="ion-close" />
        </q-fab>
      </q-page-sticky> -->
    </q-card>
  </q-dialog>
</template>
<script setup>
const props = defineProps({
  cerrarDialogo: Function,
  titulo: String,
});
</script>
