import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { processosService, policiaisService } from '@/services/api'
import { Modal } from '@/components/ui/Modal'
import { TIPOS_PROCESSO, SITUACOES_PROCESSO, SIT_LABEL } from '@/lib/constants'
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────
// CORREÇÃO DE DATA NO ENVIO DO FORMULÁRIO
//
// O input[type=date] retorna "YYYY-MM-DD" (ex: "2026-06-22").
// Se enviarmos essa string diretamente, o backend faz new Date("2026-06-22")
// que o JS interpreta como UTC midnight → em Brasília (UTC-4) vira 21/06 às 20h.
//
// Solução: ao enviar, convertemos "YYYY-MM-DD" para "YYYY-MM-DDT12:00:00"
// (meio-dia local) antes de mandar para o backend. Isso garante que,
// independente do fuso, a data sempre salve no dia correto.
// ─────────────────────────────────────────────
function normalizarDataParaEnvio(dataStr) {
  if (!dataStr) return undefined
  // "2026-06-22" → "2026-06-22T12:00:00"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    return `${dataStr}T12:00:00`
  }
  return dataStr
}

export function NovoProcessoModal({ open, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    policialId: '', tipoProcesso: '', numeroSEI: '',
    dataRecebimento: new Date().toISOString().slice(0, 10),
    dataPrazo: '', situacao: 'recebido', observacoes: '',
  })

  const { data: policiais } = useQuery({
    queryKey: ['policiais-select'],
    queryFn: () => policiaisService.listar({ limite: 500, ativo: true }),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: processosService.criar,
    onSuccess: () => {
      toast.success('Processo registrado!')
      qc.invalidateQueries({ queryKey: ['processos'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
      setForm({
        policialId: '', tipoProcesso: '', numeroSEI: '',
        dataRecebimento: new Date().toISOString().slice(0, 10),
        dataPrazo: '', situacao: 'recebido', observacoes: '',
      })
    },
    onError: (e) => toast.error(e.response?.data?.erro || 'Erro ao registrar'),
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.policialId || !form.tipoProcesso) return toast.error('Policial e tipo são obrigatórios')

    // ── CORREÇÃO: normaliza as datas antes de enviar ──
    mutation.mutate({
      ...form,
      dataRecebimento: normalizarDataParaEnvio(form.dataRecebimento),
      dataPrazo: form.dataPrazo ? normalizarDataParaEnvio(form.dataPrazo) : undefined,
    })
  }

  const lista = policiais?.dados || []

  return (
    <Modal open={open} onClose={onClose} title="Registrar processo" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Policial *</label>
            <select
              value={form.policialId}
              onChange={(e) => set('policialId', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500"
            >
              <option value="">Selecione o policial...</option>
              {lista.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.postoGraduacao} {p.nomeGuerra}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo do processo *</label>
            <select
              value={form.tipoProcesso}
              onChange={(e) => set('tipoProcesso', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500"
            >
              <option value="">Selecione...</option>
              {TIPOS_PROCESSO.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Situação</label>
            <select
              value={form.situacao}
              onChange={(e) => set('situacao', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500"
            >
              {SITUACOES_PROCESSO.map((s) => <option key={s} value={s}>{SIT_LABEL[s]}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Nº SEI</label>
            <input
              type="text"
              value={form.numeroSEI}
              onChange={(e) => set('numeroSEI', e.target.value)}
              placeholder="0029.000000/2025-00"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Data de recebimento</label>
            <input
              type="date"
              value={form.dataRecebimento}
              onChange={(e) => set('dataRecebimento', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Prazo limite</label>
            <input
              type="date"
              value={form.dataPrazo}
              onChange={(e) => set('dataPrazo', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Observações / pendências</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => set('observacoes', e.target.value)}
              rows={3}
              placeholder="Pendências, anotações..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 focus:border-pm-500 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-pm-500 hover:bg-pm-600 disabled:opacity-60 text-white rounded-lg transition-colors"
          >
            {mutation.isPending ? 'Registrando...' : 'Registrar processo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}