import { cookies } from 'next/headers';

export const ACCESS_TOKEN_COOKIE = 'den_access_token';
export const REFRESH_TOKEN_COOKIE = 'den_refresh_token';

export async function getServerSessionTokens() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;

  return {
    accessToken,
    refreshToken,
  };
}
