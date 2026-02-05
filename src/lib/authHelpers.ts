const TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function handleUnauthorized(): void {
  clearAuthToken();
  const currentPath = window.location.pathname;
  if (currentPath !== '/auth' && currentPath !== '/') {
    window.location.href = `/auth?redirect=${encodeURIComponent(currentPath)}`;
  }
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized();
  }

  return response;
}

export type AuthFetchResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; status: number };

export async function authFetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<AuthFetchResult<T>> {
  try {
    const response = await authenticatedFetch(url, options);
    
    if (response.status === 401) {
      return { success: false, error: 'Session expired. Please sign in again.', status: 401 };
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `Request failed with status ${response.status}`,
        status: response.status 
      };
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error',
      status: 0 
    };
  }
}
