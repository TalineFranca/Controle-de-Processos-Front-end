import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      await login(nomeUsuario, senha)
      navigate('/')
    } catch (err) {
      setErro('Usuário ou senha incorretos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Controle de Processos</h1>
          <p className="text-sm text-gray-400 mt-1">3º Batalhão de Polícia Militar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Usuário</label>
            <input
              type="text"
              value={nomeUsuario}
              onChange={(e) => { setNomeUsuario(e.target.value); setErro('') }}
              placeholder="seu.usuario"
              required
              autoComplete="username"
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500 ${erro ? 'border-red-300' : 'border-gray-200'}`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro('') }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500 ${erro ? 'border-red-300' : 'border-gray-200'}`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="mt-1 w-full py-2.5 bg-pm-500 hover:bg-pm-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}