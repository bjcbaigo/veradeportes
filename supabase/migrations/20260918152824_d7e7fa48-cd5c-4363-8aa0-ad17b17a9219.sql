-- Tabla aditiva: no modifica ni elimina nada existente.
CREATE TABLE IF NOT EXISTS public.product_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_ref text NOT NULL,
  source_sku text,
  parent_asset_id uuid REFERENCES public.product_assets(id) ON DELETE SET NULL,
  estado text NOT NULL DEFAULT 'ORIGINAL',
  rol text NOT NULL DEFAULT 'PRINCIPAL',
  bucket text,
  path text,
  public_url text NOT NULL,
  transform jsonb NOT NULL DEFAULT '{}'::jsonb,
  width integer,
  height integer,
  bytes integer,
  mime text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  discarded_at timestamptz,
  error_message text,
  CONSTRAINT product_assets_estado_chk CHECK (estado IN ('ORIGINAL','PROCESADA','APROBADA','DESCARTADA')),
  CONSTRAINT product_assets_rol_chk CHECK (rol IN ('PRINCIPAL','SECUNDARIA','CATALOGO','INSTAGRAM','DETALLE','EDITORIAL','MODELO_IA'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_assets TO authenticated;
GRANT ALL ON public.product_assets TO service_role;

ALTER TABLE public.product_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read product assets"
  ON public.product_assets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert product assets"
  ON public.product_assets FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product assets"
  ON public.product_assets FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product assets"
  ON public.product_assets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS product_assets_source_ref_idx ON public.product_assets (source_ref);
CREATE INDEX IF NOT EXISTS product_assets_estado_idx ON public.product_assets (estado);

-- Una sola PRINCIPAL aprobada por producto.
CREATE UNIQUE INDEX IF NOT EXISTS product_assets_one_principal_idx
  ON public.product_assets (source_ref)
  WHERE estado = 'APROBADA' AND rol = 'PRINCIPAL';

CREATE TRIGGER update_product_assets_updated_at
  BEFORE UPDATE ON public.product_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();