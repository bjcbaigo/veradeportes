CREATE TABLE public.social_publications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_ref text NOT NULL,
  source_sku text,
  product_name text,
  channel text NOT NULL DEFAULT 'instagram',
  media_url text,
  media_type text NOT NULL DEFAULT 'image',
  caption text NOT NULL DEFAULT '',
  hashtags text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'BORRADOR',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone,
  external_post_id text,
  error_message text,
  CONSTRAINT social_publications_channel_chk CHECK (channel IN ('instagram')),
  CONSTRAINT social_publications_media_type_chk CHECK (media_type IN ('image','video')),
  CONSTRAINT social_publications_status_chk CHECK (status IN ('BORRADOR','LISTO_PARA_PUBLICAR','PUBLICADO','ERROR')),
  CONSTRAINT social_publications_unique_source UNIQUE (source_ref, channel)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_publications TO authenticated;
GRANT ALL ON public.social_publications TO service_role;

ALTER TABLE public.social_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read social publications"
ON public.social_publications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert social publications"
ON public.social_publications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update social publications"
ON public.social_publications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete social publications"
ON public.social_publications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_social_publications_updated_at
BEFORE UPDATE ON public.social_publications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();