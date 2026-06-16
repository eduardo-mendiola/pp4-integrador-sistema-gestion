export async function apiRequest(path, options = {}) {
  // Si existe la variable de Vercel, úsala. Si no, usa ruta relativa (proxy de Vite)
  const baseURL = import.meta.env.VITE_API_URL || '';
  const fullUrl = baseURL ? `${baseURL}${path}` : path;

  const response = await fetch(fullUrl, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.message || payload?.error || 'Ocurrió un error';
    throw new Error(message);
  }

  return payload;
}

export function unwrapList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
}