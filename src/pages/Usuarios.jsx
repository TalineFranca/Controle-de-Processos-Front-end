import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Eye, EyeOff, PowerOff, RefreshCw, ChevronDown } from 'lucide-react'
import { usuariosService } from '@/services/api'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const PERFIS = [
  { valor: 'admin', label: 'Admin', desc: 'Acesso total' },
  { valor: 'operador', label: 'Operador', desc: 'Registra e edita processos' },
  { valor: 'visualizador', label: 'Visualizador', desc: 'Somente leitura' },
]

function BadgePerfil({ perfil }) {
  const cores = {
    admin: 'bg-pm-50 text-pm-700',
    operador: 'bg-emerald-50 text-emerald-700',
    visualizador: 'bg-gray-100 text-gray-600',
  }
  const labels = { admin: 'Admin', operador: 'Operador', visualizador: 'Visualizador' }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cores[perfil] || 'bg-gray-100 text-gray-500'}`}>
      {labels[perfil] || perfil}
    </span>
  )
}

function ModalCriar({ onClose }) {
  const queryClient = useQueryClient()
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('operador')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => usuariosService.criar({ nomeUsuario, nome, senha, perfil }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário criado com sucesso!')
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Novo usuário</h2>
          <p className="text-xs text-gray-400 mt-0.5">Preencha os dados de acesso</p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nome de usuário <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value.toLowerCase().replace(/\s/g, '.'))}
              placeholder="ex: joao.silva"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
            />
            <p className="text-xs text-gray-400 mt-1">Usado para entrar no sistema. Sem espaços.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nome completo <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome Sobrenome"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Senha <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {mostrarSenha ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Perfil de acesso</label>
            <div className="relative">
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 bg-white appearance-none"
              >
                {PERFIS.map((p) => (
                  <option key={p.valor} value={p.valor}>{p.label} — {p.desc}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error.response?.data?.mensagem || 'Erro ao criar usuário.'}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !nomeUsuario || !nome || senha.length < 8}
            className="px-4 py-2 text-sm bg-pm-600 text-white rounded-lg hover:bg-pm-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Criando...' : 'Criar usuário'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalRedefinirSenha({ usuario, onClose }) {
  const queryClient = useQueryClient()
  const [novaSenha, setNovaSenha] = useState('')
  const [mostrar, setMostrar] = useState(false)

  const { mutate, isPending } = useMutation({
    mutationFn: () => usuariosService.redefinirSenha(usuario._id, novaSenha),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Senha redefinida!')
      onClose()
    },
    onError: (e) => toast.error(e.response?.data?.mensagem || 'Erro ao redefinir senha'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Redefinir senha</h2>
          <p className="text-xs text-gray-400 mt-0.5">{usuario.nomeUsuario}</p>
        </div>
        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Nova senha</label>
          <div className="relative">
            <input
              type={mostrar ? 'text' : 'password'}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
            />
            <button type="button" onClick={() => setMostrar(!mostrar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {mostrar ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">Cancelar</button>
          <button
            onClick={() => mutate()}
            disabled={isPending || novaSenha.length < 8}
            className="px-4 py-2 text-sm bg-pm-600 text-white rounded-lg hover:bg-pm-700 disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const { usuario: eu } = useAuth()
  const queryClient = useQueryClient()
  const [modalCriar, setModalCriar] = useState(false)
  const [modalSenha, setModalSenha] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosService.listar,
  })

  const { mutate: alterarStatus } = useMutation({
    mutationFn: (id) => usuariosService.alterarStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    onError: (e) => toast.error(e.response?.data?.mensagem || 'Erro'),
  })

  const { mutate: alterarPerfil } = useMutation({
    mutationFn: ({ id, perfil }) => usuariosService.alterarPerfil(id, perfil),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
    onError: (e) => toast.error(e.response?.data?.mensagem || 'Erro'),
  })

  const lista = data?.dados || []

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-400 mt-0.5">{lista.length} usuário(s) cadastrado(s)</p>
        </div>
        <button
          onClick={() => setModalCriar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pm-600 text-white text-sm font-medium rounded-lg hover:bg-pm-700 transition-colors"
        >
          <UserPlus size={15} />
          Novo usuário
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Usuário', 'Nome', 'Perfil', 'Último acesso', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-gray-800">{u.nomeUsuario}</td>
                  <td className="px-4 py-3 text-gray-700">{u.nome}</td>
                  <td className="px-4 py-3">
                    {u._id === eu?.id ? (
                      <BadgePerfil perfil={u.perfil} />
                    ) : (
                      <div className="relative inline-block">
                        <select
                          value={u.perfil}
                          onChange={(e) => alterarPerfil({ id: u._id, perfil: e.target.value })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-pm-500/30 cursor-pointer"
                        >
                          {PERFIS.map((p) => <option key={p.valor} value={p.valor}>{p.label}</option>)}
                        </select>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {u.ultimoAcesso
                      ? new Date(u.ultimoAcesso).toLocaleString('pt-BR')
                      : 'Nunca acessou'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u._id !== eu?.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalSenha(u)}
                          title="Redefinir senha"
                          className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`${u.ativo ? 'Desativar' : 'Ativar'} o usuário ${u.nomeUsuario}?`)) alterarStatus(u._id)
                          }}
                          title={u.ativo ? 'Desativar' : 'Ativar'}
                          className={`p-1.5 rounded-lg transition-colors ${u.ativo ? 'text-red-400 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        >
                          <PowerOff size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalCriar && <ModalCriar onClose={() => setModalCriar(false)} />}
      {modalSenha && <ModalRedefinirSenha usuario={modalSenha} onClose={() => setModalSenha(null)} />}
    </div>
  )
}
