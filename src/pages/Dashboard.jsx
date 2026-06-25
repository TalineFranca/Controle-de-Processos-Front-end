import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Clock, ClipboardCheck, CalendarDays } from 'lucide-react'
import { processosService, policiaisService } from '@/services/api'

function Card({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-pm-50 text-pm-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function GraficoEfetivo({ totalPoliciais, totalFeito, totalAConferir, totalNaoFeito }) {
  const total = totalPoliciais || 0
  const feitos = totalFeito || 0
  const conferir = totalAConferir || 0
  // Policiais que ainda não têm nenhum processo registrado
  const semRegistro = Math.max(0, total - feitos - conferir - totalNaoFeito)

  const barras = [
    { label: 'Feitos', valor: feitos, cor: 'bg-emerald-500', corTexto: 'text-emerald-700', corFundo: 'bg-emerald-50' },
    ...(conferir > 0
      ? [{ label: 'A conferir', valor: conferir, cor: 'bg-sky-400', corTexto: 'text-sky-700', corFundo: 'bg-sky-50' }]
      : []),
    ...(totalNaoFeito > 0
      ? [{ label: 'Pendentes', valor: totalNaoFeito, cor: 'bg-amber-400', corTexto: 'text-amber-700', corFundo: 'bg-amber-50' }]
      : []),
    ...(semRegistro > 0
      ? [{ label: 'Sem processo', valor: semRegistro, cor: 'bg-gray-200', corTexto: 'text-gray-500', corFundo: 'bg-gray-50' }]
      : []),
  ]

  const maxValor = Math.max(total, 1)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-700">Efetivo × Processos</h2>
        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
          {total} policiais no total
        </span>
      </div>
      <p className="text-xs text-gray-400 mb-6">Do efetivo completo, quantos já têm processo feito e quantos faltam</p>

      <div className="flex flex-col gap-4">
        {barras.map(({ label, valor, cor, corTexto, corFundo }) => {
          const pct = total > 0 ? Math.round((valor / total) * 100) : 0
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">{label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${corTexto}`}>{valor}</span>
                  <span className={`text-xs ${corTexto} ${corFundo} rounded-md px-1.5 py-0.5`}>{pct}%</span>
                </div>
              </div>
              <div className="w-full h-8 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <div
                  className={`h-full ${cor} rounded-lg transition-all duration-700`}
                  style={{ width: `${Math.max(pct, valor > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Linha resumo */}
      <div className="mt-5 pt-4 border-t border-gray-50 flex items-center gap-6 text-xs text-gray-400">
        <span>
          Concluído:{' '}
          <span className="font-semibold text-emerald-600">
            {total > 0 ? Math.round((feitos / total) * 100) : 0}%
          </span>
        </span>
        <span>
          Faltam:{' '}
          <span className="font-semibold text-amber-600">{total - feitos}</span> policiais
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: processosService.dashboard,
    refetchInterval: 60000,
  })

  // Busca o total real de policiais ativos no efetivo
  const { data: policiaisData, isLoading: loadingPoliciais } = useQuery({
    queryKey: ['policiais-count'],
    queryFn: () => policiaisService.listar({ limite: 500, ativo: true }),
    refetchInterval: 60000,
  })

  const d = data?.dados
  // total real = quantidade de registros retornados
  const totalPoliciais = policiaisData?.dados?.length ?? 0

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Painel</h1>
        <p className="text-sm text-gray-400 mt-0.5">Visão geral dos processos</p>
      </div>

      {isLoading || loadingPoliciais ? (
        <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card icon={Clock} label="Não feitos (pendentes)" value={d?.totalNaoFeito} color="amber" />
            <Card icon={ClipboardCheck} label="A conferir" value={d?.totalAConferir} color="sky" />
            <Card icon={CheckCircle2} label="Feitos" value={d?.totalFeito} color="green" />
            <Card icon={CalendarDays} label="Chegaram hoje" value={d?.chegadosHoje} color="blue" />
          </div>

          <div className="mb-6">
            <GraficoEfetivo
              totalPoliciais={totalPoliciais}
              totalFeito={d?.totalFeito ?? 0}
              totalAConferir={d?.totalAConferir ?? 0}
              totalNaoFeito={d?.totalNaoFeito ?? 0}
            />
          </div>

        </>
      )}
    </div>
  )
}