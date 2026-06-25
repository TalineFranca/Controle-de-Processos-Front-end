import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, CheckCircle2, Trash2 } from 'lucide-react'
import { processosService } from '@/services/api'

// ─────────────────────────────────────────────
// CORREÇÃO DE EXIBIÇÃO DE DATA
//
// new Date("2026-06-22").toLocaleDateString('pt-BR') retorna "21/06/2026"
// porque o JS interpreta strings "YYYY-MM-DD" como UTC midnight,
// que em Brasília (UTC-4) vira o dia anterior às 20h.
//
// Solução: extrair os componentes da data diretamente da string ISO,
// sem deixar o JS fazer conversão de fuso.
// ─────────────────────────────────────────────
function formatarDataBR(dataISO) {
  if (!dataISO) return 'Sem data'
  // "2026-06-22T12:00:00.000Z" → pega os primeiros 10 caracteres "2026-06-22"
  const s = String(dataISO).slice(0, 10)
  const [ano, mes, dia] = s.split('-')
  if (!ano || !mes || !dia) return 'Sem data'
  return `${dia}/${mes}/${ano}`
}

// Chave para agrupar: usa só os 10 primeiros caracteres da ISO string
// assim "2026-06-22T12:00:00.000Z" e "2026-06-22T..." ficam no mesmo grupo
function chaveAgrupamento(dataISO) {
  if (!dataISO) return 'Sem data'
  return String(dataISO).slice(0, 10) // "YYYY-MM-DD"
}

export default function FilaChegada() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['fila-pendentes'],
    queryFn: () => processosService.listar({ status: 'naoFeito', limite: 500 }),
    refetchInterval: 30000,
  })

  const { mutate: marcarFeito, isPending: marcando } = useMutation({
    mutationFn: (id) => processosService.marcarFeito(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['policiais-processos'] })
    },
  })

  const { mutate: excluir, isPending: excluindo } = useMutation({
    mutationFn: (id) => processosService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fila-pendentes'] })
      queryClient.invalidateQueries({ queryKey: ['policiais-processos'] })
      queryClient.invalidateQueries({ queryKey: ['historico-processos'] })
    },
  })

  const lista = data?.dados || []

  // ── Agrupa por data de chegada (chave YYYY-MM-DD sem conversão de fuso) ──
  // A lista já vem ordenada pelo backend: dataRecebimento → ordemHierarquica → nrOrdem
  // Preservamos essa ordem ao agrupar usando um Map (mantém ordem de inserção)
  const porDia = lista.reduce((acc, p) => {
    const chave = chaveAgrupamento(p.dataRecebimento)
    if (!acc.has(chave)) acc.set(chave, [])
    acc.get(chave).push(p)
    return acc
  }, new Map())

  // Posição global na fila
  let posicaoGlobal = 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Fila de chegada</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Processos pendentes — ordenados por data de chegada → hierarquia → nº de ordem
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
      ) : !lista.length ? (
        <div className="text-center py-16 text-sm text-gray-400">
          <CheckCircle2 size={32} className="mx-auto text-emerald-300 mb-3" />
          Nenhum processo pendente
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from(porDia.entries()).map(([chave, procs]) => (
            <div key={chave} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <CalendarDays size={14} className="text-pm-500" />
                {/* Formata o cabeçalho do grupo com a data correta */}
                <span className="text-sm font-medium text-gray-800">
                  {formatarDataBR(chave)}
                </span>
                <span className="text-xs text-gray-400">— {procs.length} processo(s)</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400 w-10">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Policial</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Posto/Grad.</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Nr. Ordem</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Localidade</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Nº Processo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">Chegada</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {procs.map((p) => {
                    posicaoGlobal++
                    const pol = p.policialInfo || p.policial || {}
                    return (
                      <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pm-50 text-xs font-semibold text-pm-700">
                            {posicaoGlobal}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{pol.nomeGuerra || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{pol.postoGraduacao || '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{pol.nrOrdem ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{pol.localidade || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {p.numeroProcesso || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {/* Usa formatarDataBR para evitar o bug de fuso horário */}
                          {formatarDataBR(p.dataRecebimento)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => marcarFeito(p._id)}
                              disabled={marcando || excluindo}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 size={11} />
                              Feito
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Excluir este processo da fila?')) excluir(p._id)
                              }}
                              disabled={marcando || excluindo}
                              title="Excluir da fila"
                              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}