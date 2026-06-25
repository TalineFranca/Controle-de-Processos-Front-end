import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CalendarDays, CheckCircle2, Clock, RotateCcw, Trash2 } from 'lucide-react'
import { processosService } from '@/services/api'

function StatusBadge({ status }) {
  if (status === 'feito') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
        <CheckCircle2 size={10} /> Feito
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
      <Clock size={10} /> Não feito
    </span>
  )
}

export default function Processos() {
  const queryClient = useQueryClient()
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const params = { limite: 200 }
  if (busca) params.busca = busca
  if (statusFiltro) params.status = statusFiltro
  if (dataInicio) params.dataInicio = dataInicio
  if (dataFim) params.dataFim = dataFim

  const { data, isLoading } = useQuery({
    queryKey: ['historico-processos', params],
    queryFn: () => processosService.listar(params),
  })

  const { mutate: marcarFeito } = useMutation({
    mutationFn: (id) => processosService.marcarFeito(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['historico-processos'] }),
  })

  const { mutate: marcarNaoFeito } = useMutation({
    mutationFn: (id) => processosService.marcarNaoFeito(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['historico-processos'] }),
  })

  const { mutate: excluir } = useMutation({
    mutationFn: (id) => processosService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historico-processos'] })
      queryClient.invalidateQueries({ queryKey: ['policiais-processos'] })
      queryClient.invalidateQueries({ queryKey: ['fila-pendentes'] })
    },
  })

  const lista = data?.dados || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Histórico de processos</h1>
        <p className="text-sm text-gray-400 mt-0.5">{lista.length} registro(s)</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar policial..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
          />
        </div>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white"
        >
          <option value="">Todos os status</option>
          <option value="naoFeito">Não feito</option>
          <option value="feito">Feito</option>
        </select>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
          <CalendarDays size={14} className="text-gray-400" />
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="text-sm border-none outline-none bg-transparent"
          />
          <span className="text-xs text-gray-400">até</span>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="text-sm border-none outline-none bg-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
      ) : !lista.length ? (
        <div className="text-center py-16 text-sm text-gray-400">Nenhum registro encontrado</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Policial', 'Posto/Grad.', 'Localidade', 'Chegada', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const pol = p.policialInfo || p.policial || {}
                return (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{pol.nomeGuerra || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{pol.postoGraduacao || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{pol.localidade || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.dataRecebimento
                        ? new Date(p.dataRecebimento).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {p.status === 'naoFeito' ? (
                          <button
                            onClick={() => marcarFeito(p._id)}
                            title="Marcar como feito"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => marcarNaoFeito(p._id)}
                            title="Desfazer"
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Excluir este registro?')) excluir(p._id)
                          }}
                          title="Excluir"
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
