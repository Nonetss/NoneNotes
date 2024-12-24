import axios from "axios";

// URL base de la API
const BASE_URL = "http://127.0.0.1:8000/api";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función para iniciar sesión
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/usuarios/token/`, {
      email, // Corregido: usar email en lugar de username
      password,
    });
    const { access, refresh } = response.data;

    // Guardar tokens en localStorage
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // Configurar el token en los headers por defecto de la instancia de Axios
    api.defaults.headers["Authorization"] = `Bearer ${access}`;

    return response.data;
  } catch (error) {
    console.error(
      "Error al iniciar sesión:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Función para refrescar el token de acceso
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No se encontró el token de refresco.");

    const response = await axios.post(`${BASE_URL}/usuarios/token/refresh/`, {
      refresh: refreshToken,
    });
    const { access } = response.data;

    // Actualizar el token de acceso en localStorage y en los headers
    localStorage.setItem("accessToken", access);
    api.defaults.headers["Authorization"] = `Bearer ${access}`;

    return access;
  } catch (error) {
    console.error(
      "Error al refrescar el token:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Interceptor para añadir el token a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si la respuesta es 401 (no autorizado) y no hemos reintentado la solicitud
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("refreshToken")
    ) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error al intentar refrescar el token:", refreshError);
        // Opcional: puedes redirigir al usuario a la página de login aquí
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
