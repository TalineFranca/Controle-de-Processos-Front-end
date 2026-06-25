import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardCheck, CheckCircle2, Undo2 } from 'lucide-react'
import { processosService } from '@/services/api'

// Mesma correção de fuso horário usada na fila de chegada:
// extrai os componentes direto da string ISO, sem deixar o JS converter.
function formatarDataBR(dataISO) {
  if (!dataISO) return '—'
  const s = String(dataISO).slice(0, 10)
  const [ano, mes, dia] = s.split('-')
  if (!ano || !mes || !dia) return '—'
  return `${dia}/${mes}/${ano}`
}

export default function AConferir() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['aconferir-lista'],
    queryFn: () => processosService.listar({ status: 'aConferir', limite: 500 }),
    refetchInterval: 30000,
  })

  const invalidarTudo = () => {
    queryClient.invalidateQueries({ queryKey: ['aconferir-lista'] })
    queryClient.invalidateQueries({ queryKey: ['fila-pendentes'] })
    queryClient.invalidateQueries({ queryKey: ['policiais-processos'] })
  }

  const { mutate: aprovar, isPending: aprovando } = useMutation({
    mutationFn: (id) => processosService.marcarFeito(id),
    onSuccess: invalidarTudo,
  })

  // Devolve para a fila (status = naoFeito). Mantém a dataRecebimento original,
  // então o registro volta para o lugar certo na fila — mesma lógica de
  // ordenação de sempre (data de chegada → antiguidade). Se a pessoa informar
  // um motivo, ele é salvo nas observações do processo.
  const { mutate: devolver, isPending: devolvendo } = useMutation({
    mutationFn: ({ id, motivo }) => processosService.marcarNaoFeito(id, motivo),
    onSuccess: invalidarTudo,
  })

  const handleDevolver = (id) => {
    const motivo = window.prompt('O que precisa ser corrigido? (opcional)')
    if (motivo === null) return // cancelou
    devolver({ id, motivo: motivo.trim() || undefined })
  }

  const lista = data?.dados || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">A conferir</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Processos já feitos, aguardando revisão antes de fechar — {lista.length} registro(s)
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
      ) : !lista.length ? (
        <div className="text-center py-16 text-sm text-gray-400">
          <ClipboardCheck size={32} className="mx-auto text-pm-300 mb-3" />
          Nada aguardando conferência
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Policial</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Posto/Grad.</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Nr. Ordem</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Nº Processo</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Chegada</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => {
                const pol = p.policialInfo || p.policial || {}
                return (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{pol.nomeGuerra || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{pol.postoGraduacao || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{pol.nrOrdem ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {p.numeroProcesso || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatarDataBR(p.dataRecebimento)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => aprovar(p._id)}
                          disabled={aprovando || devolvendo}
                          title="Aprovar e marcar como feito"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 size={11} />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleDevolver(p._id)}
                          disabled={aprovando || devolvendo}
                          title="Devolver para a fila"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Undo2 size={11} />
                          Devolver
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
