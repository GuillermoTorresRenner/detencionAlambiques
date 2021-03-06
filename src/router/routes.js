const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/LoginApp.vue") },
      {
        path: "/estado-alambiques",
        component: () => import("src/pages/EstadoAlambiques.vue"),
      },

      {
        path: "/validar-detenciones",
        component: () => import("src/pages/ValidarDetenciones.vue"),
      },
      {
        path: "/reportes-detenciones",
        component: () => import("src/pages/ReportesDetenciones.vue"),
      },
      {
        path: "/bienvenida",
        component: () => import("src/pages/PaginaBienvenida.vue"),
      },
      {
        path: "/usuarios",
        component: () => import("src/pages/GestionUsuarios.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
