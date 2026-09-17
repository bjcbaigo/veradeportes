/**
 * Contrato de publicación en redes — preparado para la ETAPA 2.
 *
 * ETAPA 1 (actual): no hay ninguna conexión con Meta, no se hace ningún request
 * externo y no se guardan tokens. El único implementador disponible es un stub que
 * informa que la cuenta profesional todavía no está conectada.
 *
 * ETAPA 2: se agregará un implementador real de Instagram (Graph API, cuenta
 * PROFESIONAL) que opere sobre una publicación ya persistida en estado
 * LISTO_PARA_PUBLICAR y la actualice a PUBLICADO o ERROR. Los tokens de Meta se
 * gestionarán aparte (Secrets / tabla de conexión propia), nunca en
 * social_publications.
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
  /** Solo se invocará con una publicación persistida en LISTO_PARA_PUBLICAR. */
  publishNow(req: PublishRequest): Promise<PublishResult>;
}

export const INSTAGRAM_NOT_CONNECTED_MESSAGE =
  "Instagram todavía no está conectado. Este paso prepara la publicación; la publicación real se habilitará al conectar la cuenta profesional en la Etapa 2.";

/** Stub de ETAPA 1: no hace requests ni usa credenciales. */
export const instagramPublisherStub: SocialPublisher = {
  channel: "instagram",
  async getConnection() {
    return {
      channel: "instagram",
      connected: false,
      detail: "Cuenta profesional requerida",
    };
  },
  async publishNow() {
    throw new Error(INSTAGRAM_NOT_CONNECTED_MESSAGE);
  },
};
