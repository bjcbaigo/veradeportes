import { supabase } from "@/integrations/supabase/client";

export type OAuthDetails = {
  client?: { name?: string; client_uri?: string };
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
};

export const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
