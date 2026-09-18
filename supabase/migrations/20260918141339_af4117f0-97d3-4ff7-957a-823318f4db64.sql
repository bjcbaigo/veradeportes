ALTER TABLE public.social_publications DROP CONSTRAINT IF EXISTS social_publications_status_chk;
ALTER TABLE public.social_publications DROP CONSTRAINT IF EXISTS social_publications_status_check;
ALTER TABLE public.social_publications ADD CONSTRAINT social_publications_status_check CHECK (status = ANY (ARRAY['BORRADOR','LISTO_PARA_PUBLICAR','PUBLICANDO','PUBLICADO','ERROR']));