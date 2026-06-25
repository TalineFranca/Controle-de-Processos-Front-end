import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pm_token')
      localStorage.removeItem('pm_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authService = {
  login: (nomeUsuario, senha) =>
    api.post('/auth/login', { nomeUsuario, senha }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

// ── Usuários (admin) ──────────────────────────────────
export const usuariosService = {
  listar: () => api.get('/auth/usuarios').then((r) => r.data),
  criar: (body) => api.post('/auth/usuarios', body).then((r) => r.data),
  alterarStatus: (id) => api.patch(`/auth/usuarios/${id}/status`).then((r) => r.data),
  alterarPerfil: (id, perfil) => api.patch(`/auth/usuarios/${id}/perfil`, { perfil }).then((r) => r.data),
  redefinirSenha: (id, novaSenha) => api.patch(`/auth/usuarios/${id}/senha`, { novaSenha }).then((r) => r.data),
}

// ── Processos ─────────────────────────────────────────
export const processosService = {
  listar: (params) => api.get('/processos', { params }).then((r) => r.data),
  obter: (id) => api.get(`/processos/${id}`).then((r) => r.data),
  criar: (body) => api.post('/processos', body).then((r) => r.data),
  marcarFeito: (id) => api.patch(`/processos/${id}/feito`).then((r) => r.data),
  marcarConferir: (id) => api.patch(`/processos/${id}/conferir`).then((r) => r.data),
  marcarNaoFeito: (id, motivo) => api.patch(`/processos/${id}/nao-feito`, { motivo }).then((r) => r.data),
  excluir: (id) => api.delete(`/processos/${id}`).then((r) => r.data),
  dashboard: () => api.get('/processos/dashboard').then((r) => r.data),
}

// ── Policiais ─────────────────────────────────────────
export const policiaisService = {
  listar: (params) => api.get('/policiais', { params }).then((r) => r.data),
  obter: (id) => api.get(`/policiais/${id}`).then((r) => r.data),
}
