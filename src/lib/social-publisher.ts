/**
 * Contrato de publicación en redes.
 *
 * ETAPA 2 (actual): la implementación real vive server-side y está desacoplada
 * de la UI:
 *  - `src/lib/instagram-provider.server.ts` — OAuth, identidad y publicación
 *    contra la API oficial de Meta (Instagram API con Instagram Login).
 *  - `src/lib/social-connections.functions.ts` — estado, conectar, desconectar
 *    y publicar (solo admin autenticado; el token nunca sale del servidor).
 *
 * Este archivo conserva el contrato genérico para agregar otros canales sin
 * tocar el panel. Los tokens se guardan solo en `social_connections`, nunca en
 * `social_publications`.
 */

export type SocialChannel = "instagram";

export interface SocialConnectionState {
  channel: SocialChannel;
  connected: boolean;
  /** Motivo/estado legible para la UI. */
  detail: string;
}

export interface PublishRequest {
  publicationId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
}

export interface PublishResult {
  status: "PUBLICADO" | "ERROR";
  externalPostId?: string;
  errorMessage?: string;
}

export interface SocialPublisher {
  channel: SocialChannel;
  getConnection(): Promise<SocialConnectionState>;
  /** Solo se invoca con una publicación persistida en LISTO_PARA_PUBLICAR. */
  publishNow(req: PublishRequest): Promise<PublishResult>;
}

export const INSTAGRAM_PROFESSIONAL_NOTICE =
  "La cuenta a conectar debe ser PROFESIONAL de Instagram (Business o Creator). Las cuentas personales no pueden publicar por la API oficial.";

export const INSTAGRAM_NOT_CONFIGURED_MESSAGE =
  "Falta configurar la app de Meta para habilitar la conexión con Instagram.";

export const INSTAGRAM_NOT_CONNECTED_MESSAGE =
  "Todavía no hay una cuenta profesional de Instagram conectada. Conectala para poder publicar desde el panel.";
