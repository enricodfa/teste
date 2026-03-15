import { supabase } from '../lib/supabase';

/**
 * Returns the current session's access token.
 * Throws if there is no active session.
 */
export async function getToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('No active session');
  return data.session.access_token;
}
