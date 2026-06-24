import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const s = localStorage.getItem('pm_usuario')
    return s ? JSON.parse(s) : null
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pm_token')
    if (token) {
      authService.me()
        .then((r) => setUsuario(r.dados))
        .catch(() => logout())
        .finally(() => setCarregando(false))
    } else {
      setCarregando(false)
    }
  }, [])

  const salvarSessao = (r) => {
    const token = r.dados?.accessToken || r.dados?.token
    const user = r.dados?.usuario || r.dados
    localStorage.setItem('pm_token', token)
    localStorage.setItem('pm_usuario', JSON.stringify(user))
    setUsuario(user)
    return r
  }

  const login = async (nomeUsuario, senha) => {
    const r = await authService.login(nomeUsuario, senha)
    return salvarSessao(r)
  }

  const logout = () => {
    localStorage.removeItem('pm_token')
    localStorage.removeItem('pm_usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
