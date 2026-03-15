const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type RequestOptions = {
  headers?: Record<string, string>;
  token?: string;
};

function buildHeaders(options?: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function get<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(options),
  });
  return handleResponse<T>(res);
}

export async function post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(options),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function put<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(options),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function patch<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(options),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function del<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(options),
  });
  return handleResponse<T>(res);
}
