import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import { processosService } from '@/services/api'

function formatarDataBR(dataISO) {
  if (!dataISO) return '—'
  const s = String(dataISO).slice(0, 10)
  const [ano, mes, dia] = s.split('-')
  if (!ano || !mes || !dia) return '—'
  return `${dia}/${mes}/${ano}`
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function Relatorio() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth()) // 0-11
  const [ano, setAno] = useState(hoje.getFullYear())
  const printRef = useRef()

  // Busca todos os processos feitos
  const { data, isLoading } = useQuery({
    queryKey: ['relatorio-feitos', mes, ano],
    queryFn: () => {
      const dataInicio = `${ano}-${String(mes + 1).padStart(2, '0')}-01`
      const ultimoDia = new Date(ano, mes + 1, 0).getDate()
      const dataFim = `${ano}-${String(mes + 1).padStart(2, '0')}-${ultimoDia}`
      return processosService.listar({ status: 'feito', dataInicio, dataFim, limite: 500 })
    },
    staleTime: 60000,
  })

  const lista = (data?.dados || []).map((p, i) => ({
    ...p,
    pol: p.policialInfo || p.policial || {},
  }))

  // Ordena: hierarquia → nrOrdem → data de chegada
  const ordenada = [...lista].sort((a, b) => {
    const ha = a.pol.ordemHierarquica ?? 99
    const hb = b.pol.ordemHierarquica ?? 99
    if (ha !== hb) return ha - hb
    const oa = a.pol.nrOrdem ?? 9999
    const ob = b.pol.nrOrdem ?? 9999
    if (oa !== ob) return oa - ob
    return new Date(a.dataRecebimento) - new Date(b.dataRecebimento)
  })

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }

  const mesSeguinte = () => {
    if (mes === 11) { setMes(0); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  const handlePrint = () => {
    const conteudo = printRef.current.innerHTML
    const janela = window.open('', '_blank')
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Relatório ${MESES[mes]} ${ano}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 20px; }
          h1 { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 4px; }
          p.sub { font-size: 11px; text-align: center; color: #444; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f0f0f0; font-size: 10px; font-weight: bold; text-align: left; padding: 6px 8px; border: 1px solid #ccc; }
          td { padding: 5px 8px; border: 1px solid #ddd; vertical-align: top; }
          tr:nth-child(even) td { background: #fafafa; }
          .mono { font-family: monospace; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>${conteudo}</body>
      </html>
    `)
    janela.document.close()
    janela.focus()
    setTimeout(() => { janela.print(); janela.close() }, 300)
  }

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Relatório mensal</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Processos concluídos — ordenados por hierarquia → antiguidade → chegada
          </p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!ordenada.length}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-pm-600 text-white rounded-lg hover:bg-pm-700 disabled:opacity-40 transition-colors"
        >
          <Printer size={15} />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Seletor de mês */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={mesAnterior}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-2.5 min-w-44 text-center">
          <p className="text-base font-semibold text-gray-900">{MESES[mes]}</p>
          <p className="text-xs text-gray-400">{ano}</p>
        </div>
        <button
          onClick={mesSeguinte}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        {!isLoading && (
          <span className="text-sm text-gray-400 ml-2">
            {ordenada.length} processo(s) concluído(s)
          </span>
        )}
      </div>

      {/* Conteúdo que será impresso */}
      <div ref={printRef}>
        <h1>Relatório de Processos Concluídos — {MESES[mes]} de {ano}</h1>
        <p className="sub">3º Batalhão de Polícia Militar · Ordenado por hierarquia → antiguidade → data de chegada</p>

        {isLoading ? (
          <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
        ) : !ordenada.length ? (
          <div className="text-center py-16 text-sm text-gray-400">
            <FileText size={32} className="mx-auto text-gray-200 mb-3" />
            Nenhum processo concluído em {MESES[mes]} de {ano}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 w-10">Ordem</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Posto/Grad.</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Matrícula</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Nome Completo</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Nome de Guerra</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Nº Processo</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">Chegada</th>
                </tr>
              </thead>
              <tbody>
                {ordenada.map((p, i) => (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pm-50 text-xs font-semibold text-pm-700">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">{p.pol.postoGraduacao || '—'}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">{p.pol.matricula || '—'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.pol.nomeCompleto || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.pol.nomeGuerra || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.numeroProcesso || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatarDataBR(p.dataRecebimento)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}