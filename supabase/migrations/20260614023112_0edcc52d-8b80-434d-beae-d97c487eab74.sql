DROP POLICY "Anyone can register a lead" ON public.leads;
CREATE POLICY "Anyone can register a lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nombre) BETWEEN 1 AND 120
    AND char_length(whatsapp) BETWEEN 6 AND 30
  );