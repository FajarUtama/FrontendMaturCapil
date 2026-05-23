const TOKEN_KEY = 'maturcapil_access_token';
const REFRESH_KEY = 'maturcapil_refresh_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const setAccessToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken = (token) => {
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
};

export const clearAuthTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const setAuthTokens = ({ accessToken, refreshToken }) => {
  setAccessToken(accessToken);
  if (refreshToken !== undefined) setRefreshToken(refreshToken);
};
