// Nombre de la cookie donde se guarda la sesión del usuario.
export const SESSION_COOKIE_NAME = "session_token";

// Fixture: replica manualmente session_inactivity_minutes de ../Portal-Horarios-Backend/src/core/config.py.
export const INACTIVITY_TIMEOUT_MINUTES = 30;

// Clave de localStorage usada para avisar logout a las demás pestañas.
export const LOGOUT_BROADCAST_KEY = "portal_horarios_logout_signal";

// Nombre del query param que guarda la pantalla previa a una expiración de sesión.
export const NEXT_QUERY_PARAM = "next";
