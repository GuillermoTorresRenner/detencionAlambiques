<template>
  <q-page>
    <h5 class="text-center">Gestión de Usuarios</h5>
    <q-form @submit.prevent="agregarUsuario()" class="q-gutter-md">
      <div class="row justify-center">
        <q-input
          v-model.trim="usuario.nombre"
          type="text"
          label="Nombre y apellido"
          class="col q-mx-xl"
          lazy-rules="ondemand"
          :rules="[
            (val) => val.length >= 3 || 'Por favor Escriba Nombre y apellido',
          ]"
        />
      </div>
      <div class="row justify-center">
        <q-select
          v-model="usuario.rol"
          :options="['destilador', 'administrador']"
          label="Rol Usuario"
          filled
          class="col q-mx-xl"
          lazy-rules="ondemand"
          :rules="[(val) => val.length > 0 || 'Por favor Selecciones un rol']"
        />
        <q-select
          v-model="usuario.sala"
          :options="['sala 1', 'sala 2']"
          label="Sala Destilación"
          filled
          class="col q-mx-xl"
          v-if="usuario.rol === 'destilador'"
          lazy-rules="ondemand"
          :rules="[
            (val) =>
              (val.length > 0 && usuario.rol === 'destilador') ||
              'Por favor seleccione una Sala de destilación',
          ]"
        />
      </div>
      <div class="row justify-center">
        <q-input
          v-model="usuario.email"
          type="text"
          label="e-mail"
          class="col q-ml-xl"
          :suffix="sufijo"
          :hint="`sugerido: ${usuario.nombre.charAt(0).toLowerCase()}${(
            usuario.nombre.substring(
              usuario.nombre.indexOf(' '),
              usuario.nombre.length
            ) + '@ccu.cl'
          )
            .trim()
            .toLowerCase()}`"
          lazy-rules="ondemand"
          :rules="[
            (val) =>
              val.length >= 3 || 'Por favor Escriba un email sin dominio ',
          ]"
        />
        <q-input
          v-model="pass"
          type="text"
          label="password"
          class="col q-ml-md q-mr-xl"
          readonly
        />
      </div>

      <div class="row justify-center q-mb-xl">
        <q-btn type="submit" color="green" icon="ion-save" />
      </div>
    </q-form>

    Tabla para mostrar usuarios
    <q-table
      title="Listado de Usuarios"
      :rows="usr.getUsuarios"
      :columns="columns"
      row-key="id"
      :filter="filter"
      dense
      class="my-sticky-header-table"
      no-data-label="Sin usuarios para mostrar"
    >
      <template v-slot:body-cell-eliminar="props">
        <q-td :props="props">
          <div>
            <q-btn
              color="negative"
              icon="ion-trash"
              @click="eliminarUsuario(props.row)"
              size="sm"
              dense
            />
          </div>
          <div class="my-table-details">
            {{ props.row.details }}
          </div>
        </q-td>
      </template>

      <template v-slot:top-right>
        <q-input
          borderless
          dense
          debounce="300"
          v-model="filter"
          placeholder="Buscar"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">{{ mensaje }}</span>
        </q-card-section>
        <q-card-section align="center">
          <q-spinner-pie color="green" size="md" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { db, auth } from "src/boot/firebase";
import { deleteDoc, doc, setDoc } from "@firebase/firestore";
import { useQuasar } from "quasar";
import { useUsuarios } from "src/stores/useUsuarios";
import { onSnapshot, collection } from "@firebase/firestore";
const usr = useUsuarios();
const confirm = ref(false);
const mensaje = ref("");
const filter = ref("");
const columns = [
  {
    name: "nombre",
    label: "Nombre",
    field: "nombre",
    align: "center",
    sortable: true,
  },
  { name: "rol", label: "Rol", field: "rol", align: "center", sortable: true },
  {
    name: "email",
    label: "E-mail",
    field: "email",
    align: "center",
    sortable: true,
  },
  {
    name: "sala",
    label: "Sala",
    field: "sala",
    align: "center",
    sortable: true,
  },
  {
    name: "password",
    label: "Password",
    field: "password",
    align: "center",
    sortable: true,
  },
  {
    name: "eliminar",
    label: "Eliminar",
    field: "eliminar",
    align: "center",
    sortable: true,
  },
];
const $q = useQuasar();
const pass = computed(() => {
  return usuario.value.nombre !== ""
    ? parseInt(Math.random() * 1000000).toString()
    : "Pass autogenerado";
});

const mail = computed(() => {
  return nombre.value.charAt[0] + apellido.value + "@ccu.cl";
});
const sufijo = "@ccu.cl";
const usuario = ref({
  nombre: "",
  sala: "",
  rol: "",
  uid: "",
  email: "",
  password: "",
});
const mailFinal = computed(() => {
  return usuario.value.email.toLowerCase() + sufijo;
});

async function agregarUsuario() {
  mensaje.value = "Creando Usuario nuevo";
  confirm.value = true;
  usuario.value.email = mailFinal.value;
  usuario.value.password = pass.value;
  try {
    await createUserWithEmailAndPassword(
      auth,
      usuario.value.email,
      usuario.value.password
    )
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        usuario.value.uid = user.uid;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log("Error creando correo:", errorMessage);
        // ..
      });

    await setDoc(doc(db, "usuarios", usuario.value.uid), usuario.value);
    $q.notify({
      message: "Usuario Creado Exitosamente",
      caption: `${usuario.value.rol}: ${usuario.value.nombre} de ${usuario.value.sala}`,
      color: "green",
      position: "bottom",
      icon: "check",
    });

    usuario.value = {
      nombre: "",
      sala: "",
      rol: "",
      uid: "",
      email: "",
      passDefault: true,
    };
    confirm.value = false;
  } catch (error) {
    console.log("Error general:", error);
  }
}
function eliminarUsuario(registro) {
  $q.notify({
    message: `¿Desea Eliminar al usuario ${registro.nombre}?`,
    color: "purple",
    position: "top",
    icon: "ion-trash",
    actions: [
      {
        label: "Eliminar",
        icon: "ion-trash",
        color: "red",
        handler: async () => {
          mensaje.value = "Eliminando Usuario";
          confirm.value = true;
          await deleteDoc(doc(db, "usuarios", registro.uid));
          $q.notify({
            message: "Usuario Eliminado Exitosamente",

            color: "red",
            position: "bottom",
            icon: "ion-trash",
          });
          confirm.value = false;
        },
      },
      {
        label: "Cancelar",
        color: "warning",
        icon: "ion-close",
        handler: () => {},
      },
    ],
  });
}

onMounted(() => {
  //Obtener data de usuarios en tiempo real
  onSnapshot(collection(db, "usuarios"), (cambios) => {
    cambios.docChanges().forEach((c) => {
      if (c.type === "added") {
        usr.addUsuario(c.doc.data());
      }
      if (c.type === "removed") {
        usr.removeUsuario(c.doc.data().uid);
      }
    });
  });
});
</script>
