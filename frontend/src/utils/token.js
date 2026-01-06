const ACCESS_TOKEN_KEY = 'notes_app_access_token';
const REFRESH_TOKEN_KEY = 'notes_app_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function removeTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Backward compatibility
export function getToken() {
  return getAccessToken();
}

export function setToken(token) {
  setTokens(token, null);
}

export function removeToken() {
  removeTokens();
}

