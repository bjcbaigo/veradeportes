ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.leads ALTER COLUMN whatsapp DROP NOT NULL;

DROP POLICY IF EXISTS "Anyone can register a lead" ON public.leads;
CREATE POLICY "Anyone can register a lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nombre) BETWEEN 1 AND 120
    AND (email IS NULL OR (char_length(email) BETWEEN 5 AND 200 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'))
    AND (whatsapp IS NULL OR char_length(whatsapp) BETWEEN 6 AND 30)
    AND (email IS NOT NULL OR whatsapp IS NOT NULL)
  );