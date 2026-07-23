import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listPendingCargasTool from "./tools/list-pending-cargas";
import updateCargaEstadoTool from "./tools/update-carga-estado";
import listLeadsTool from "./tools/list-leads";
import listLandingProductsTool from "./tools/list-landing-products";
import publishLandingProductTool from "./tools/publish-landing-product";
import updateLandingProductTool from "./tools/update-landing-product";
import listProductosAdminTool from "./tools/list-productos-admin";

// The OAuth issuer must be the direct Supabase host — the published proxy
// URL would fail RFC 8414 issuer discovery. Read the project ref via
// import.meta.env so Vite inlines it at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vera-deportes-mcp",
  title: "Vera Deportes",
  version: "0.1.0",
  instructions:
    "Herramientas de administración de Vera Deportes: revisar cargas de fotos pendientes, cambiar su estado, listar leads, y publicar/editar productos de la landing directamente. Todas requieren rol admin en la app.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoamiTool,
    listPendingCargasTool,
    updateCargaEstadoTool,
    listLeadsTool,
    listLandingProductsTool,
    publishLandingProductTool,
    updateLandingProductTool,
    listProductosAdminTool,
  ],
});
