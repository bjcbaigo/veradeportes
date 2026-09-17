CREATE TABLE public.social_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel text NOT NULL DEFAULT 'instagram' CHECK (channel IN ('instagram')),
  provider text NOT NULL DEFAULT 'instagram_login',
  external_account_id text NOT NULL,
  username text,
  account_type text,
  access_token text NOT NULL,
  token_expires_at timestamptz,
  scopes text,
  is_active boolean NOT NULL DEFAULT true,
  connected_by uuid,
  connected_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  disconnected_at timestamptz
);

CREATE UNIQUE INDEX social_connections_one_active_per_channel
  ON public.social_connections (channel) WHERE is_active;

GRANT ALL ON public.social_connections TO service_role;
REVOKE ALL ON public.social_connections FROM anon, authenticated;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages social connections"
  ON public.social_connections FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON public.social_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.social_oauth_states (
  state text NOT NULL PRIMARY KEY,
  channel text NOT NULL DEFAULT 'instagram',
  created_by uuid,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.social_oauth_states TO service_role;
REVOKE ALL ON public.social_oauth_states FROM anon, authenticated;
ALTER TABLE public.social_oauth_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages oauth states"
  ON public.social_oauth_states FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');