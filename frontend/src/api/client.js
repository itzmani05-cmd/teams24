const buildQuery = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};

export const createApiClient = (tokenKey) => {
  const getToken = () => {
    try {
      return localStorage.getItem(tokenKey);
    } catch {
      return null;
    }
  };
  const setToken = (token) => localStorage.setItem(tokenKey, token);
  const clearToken = () => localStorage.removeItem(tokenKey);

  let onUnauthorized = () => {};
  const setUnauthorizedHandler = (handler) => {
    onUnauthorized = handler;
  };

  const request = async (method, path, { body, params } = {}) => {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`/api${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && token) onUnauthorized();
      const details = data.errors
        ? Object.entries(data.errors)
            .map(([field, msgs]) => `${field}: ${[].concat(msgs).join(", ")}`)
            .join("; ")
        : "";
      throw new Error(details ? `${data.message} (${details})` : data.message || "Request failed");
    }

    return data.data ?? data;
  };

  const api = {
    get: (path, params) => request("GET", path, { params }),
    post: (path, body) => request("POST", path, { body }),
    patch: (path, body) => request("PATCH", path, { body }),
    delete: (path) => request("DELETE", path),
  };

  return { api, getToken, setToken, clearToken, setUnauthorizedHandler };
};

const admin = createApiClient("admin_token");

export const { api, getToken, setToken, clearToken, setUnauthorizedHandler } = admin;
