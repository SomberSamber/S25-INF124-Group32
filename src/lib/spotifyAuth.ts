// Spotify OAuth utility functions

export interface SpotifyAuthResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  state?: string;
}

// Extract Spotify access token from URL hash after OAuth redirect
export const extractSpotifyTokenFromUrl = (): SpotifyAuthResult | null => {
  const hash = window.location.hash.substring(1);
  
  if (!hash) return null;
  
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const tokenType = params.get('token_type');
  const expiresIn = params.get('expires_in');
  const state = params.get('state');
  
  if (!accessToken || !tokenType || !expiresIn) {
    return null;
  }
  
  return {
    accessToken,
    tokenType,
    expiresIn: parseInt(expiresIn, 10),
    state: state || undefined
  };
};

// Clear the hash from URL after extracting token
export const clearSpotifyHashFromUrl = (): void => {
  // Replace current URL without the hash to clean up the address bar
  const newUrl = window.location.protocol + '//' + 
                 window.location.host + 
                 window.location.pathname + 
                 window.location.search;
  window.history.replaceState({}, document.title, newUrl);
};

// Store Spotify token in sessionStorage
export const storeSpotifyToken = (authResult: SpotifyAuthResult): void => {
  sessionStorage.setItem('spotify_access_token', authResult.accessToken);
  sessionStorage.setItem('spotify_token_type', authResult.tokenType);
  sessionStorage.setItem('spotify_expires_at', 
    (Date.now() + authResult.expiresIn * 1000).toString()
  );
};

// Get stored Spotify token from sessionStorage
export const getStoredSpotifyToken = (): string | null => {
  const token = sessionStorage.getItem('spotify_access_token');
  const expiresAt = sessionStorage.getItem('spotify_expires_at');
  
  if (!token || !expiresAt) return null;
  
  // Check if token is expired
  if (Date.now() > parseInt(expiresAt, 10)) {
    clearStoredSpotifyToken();
    return null;
  }
  
  return token;
};

// Clear stored Spotify token
export const clearStoredSpotifyToken = (): void => {
  sessionStorage.removeItem('spotify_access_token');
  sessionStorage.removeItem('spotify_token_type');
  sessionStorage.removeItem('spotify_expires_at');
};

// Check if current URL contains Spotify OAuth callback
export const isSpotifyCallback = (): boolean => {
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  return searchParams.has('code') || (hash.includes('access_token') && hash.includes('token_type'));
};

// Extract authorization code from URL parameters
export const extractSpotifyCodeFromUrl = (): string | null => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('code');
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (code: string, clientId: string): Promise<SpotifyAuthResult | null> => {
  try {
    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.error('Code verifier not found in session storage');
      return null;
    }

    const redirectUri = window.location.origin + '/';
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!response.ok) {
      console.error('Token exchange failed:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Clean up the code verifier
    sessionStorage.removeItem('spotify_code_verifier');
    
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return null;
  }
};

// Clear the search params from URL after extracting code
export const clearSpotifyCodeFromUrl = (): void => {
  const newUrl = window.location.protocol + '//' + 
                 window.location.host + 
                 window.location.pathname;
  window.history.replaceState({}, document.title, newUrl);
}; 