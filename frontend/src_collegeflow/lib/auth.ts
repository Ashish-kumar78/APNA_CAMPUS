export const TOKEN_KEY = 'collegeflow_token';
export const USER_KEY = 'collegeflow_user';

export function readSession() {
  const rawUser = localStorage.getItem(USER_KEY);
  const rawToken = localStorage.getItem(TOKEN_KEY);

  if (!rawUser || !rawToken) {
    return null;
  }

  if (rawToken === 'demo-jwt-token') {
    clearSession();
    return null;
  }

  try {
    return {
      user: JSON.parse(rawUser),
      token: rawToken,
    };
  } catch {
    return null;
  }
}

export function saveSession(user: unknown, token: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
