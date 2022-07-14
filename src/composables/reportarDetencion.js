import { useUsuarios } from "src/stores/useUsuarios";
import { useAlambiques } from "../stores/useAlambiques";
import { db } from "src/boot/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

const detencion = useAlambiques();
const usuario = useUsuarios();

const reportarDetencion = async () => {
  //guardar datos en DB
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
  detencion.getDetencion.fechaDetecion = d + "/" + m + "/" + a;
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
  detencion.getDetencion.horaDetencion = h + ":" + min + ":" + s;
  detencion.getDetencion.sala = usuario.getUsuario.sala;
  detencion.getDetencion.destilador = usuario.getUsuario.nombre;
  detencion.getDetencion.id =
    "F" +
    d +
    m +
    a +
    "H" +
    h +
    min +
    s +
    "S" +
    detencion.getDetencion.sala.substring(5, 7) +
    "A" +
    detencion.getDetencion.alambique.substring(10, 12);
  detencion.getDetencion.momentoDetencion = date.getTime() / 3600000;
  detencion.getDetencion.estado =
    detencion.getDetencion.causaDetencion === "detención programada"
      ? "detención programada"
      : "detención por falla";
  detencion.findAlambiqueByNameAndStopIt(
    detencion.getDetencion.alambique,
    detencion.getDetencion.causaDetencion
  );

  //Enviar correo
  if (detencion.getDetencion.causaDetencion !== "detención programada") {
    emailjs
      .send(
        "service_l5hg039",
        "template_u5hv00r",
        detencion.getDetencion,
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

  //Guardado en colección detenciones, daatos tomados desde el objeto detenciones de esta vista.
  await setDoc(
    doc(db, "detenciones", detencion.getDetencion.id),
    detencion.getDetencion
  );

  //Guardado en colección alambiques, datos tomados desde store y modificados con findAlambiqueByNameAndStopIt
  await setDoc(
    doc(db, "alambiques", detencion.getAlambique.numero),
    detencion.getAlambique
  );
};

async function restablecer(nombreAlambique) {
  //Seteo de datos de alambique para volver a restableerlos en el store y posteriormente subirlos a la base de datos
  const a = detencion.getAlambiques
    .filter((a) => a.nombre === nombreAlambique)
    .forEach((a) => {
      detencion.setAlambique(a);
    });

  detencion.getAlambique.estado = "operativo";
  detencion.getAlambique.desde = "";
  detencion.getAlambique.causa = "";

  //Seteo de datos para restablecer y completar los datos de la detención, posteriormente se subirá a la base de datos.
  const det = detencion.getDetencionesActivas.filter(
    (d) => d.alambique === nombreAlambique
  );

  const date = new Date();
  det[0].estado = "operativo";

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

  det[0].fechaRestablecimiento = d + "/" + m + "/" + y;
  det[0].horaRestablecimiento = h + ":" + min + ":" + s;
  det[0].momentoRestablecimiento = date.getTime() / 3600000;
  //Cálculo de tiempo de detención
  det[0].duracionDetencion = (
    det[0].momentoRestablecimiento - det[0].momentoDetencion
  ).toFixed(1);

  //Guardar Datos en DB
  await setDoc(
    doc(db, "alambiques", detencion.getAlambique.numero),
    detencion.getAlambique
  );

  await setDoc(doc(db, "detenciones", det[0].id), det[0]);
}

export { reportarDetencion, restablecer };
