import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MapPin, Plus, CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import { policiaisService, processosService } from '@/services/api'

// ── Modal de Registro ────────────────────────────────
function ModalRegistrar({ policial, onClose }) {
  const queryClient = useQueryClient()
  const [dataRecebimento, setDataRecebimento] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      processosService.criar({
        policialId: policial._id,
        dataRecebimento,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processos'] })
      queryClient.invalidateQueries({ queryKey: ['policiais-processos'] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Registrar processo</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {policial.postoGraduacao} {policial.nomeGuerra}
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Data de chegada <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={dataRecebimento}
              onChange={(e) => setDataRecebimento(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">
              {error.response?.data?.mensagem || 'Erro ao registrar.'}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutate()}
            disabled={isPending || !dataRecebimento}
            className="px-4 py-2 text-sm bg-pm-600 text-white rounded-lg hover:bg-pm-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Badge de Status ──────────────────────────────────
function StatusBadge({ registros }) {
  const pendente = registros?.find((r) => r.status === 'naoFeito')
  if (pendente) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
        <Clock size={10} />
        Não feito
      </span>
    )
  }
  if (registros?.length > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
        <CheckCircle2 size={10} />
        Feito
      </span>
    )
  }
  return <span className="text-xs text-gray-400">—</span>
}

// ── Tabela de Policiais ──────────────────────────────
function TabelaPoliciais({ pols, processosPorPolicial, onRegistrar }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {['Nr. Ordem', 'Posto/Grad.', 'Nome de guerra', 'Nome completo', 'Status', 'Unidade', ''].map((h) => (
            <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-400">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pols.map((p) => {
          const registros = processosPorPolicial[p._id] || []
          // Unidade: mostra CIA > PEL > GP em cascata (o mais específico disponível)
          const unidadeExibicao = [p.cia, p.pel, p.gp].filter(Boolean).join(' / ') || p.unidade || '—'
          return (
            <tr key={p._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700">{p.nrOrdem ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-gray-500">{p.postoGraduacao || '—'}</td>
              <td className="px-4 py-3 font-medium text-gray-900">{p.nomeGuerra || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{p.nomeCompleto || '—'}</td>
              <td className="px-4 py-3">
                <StatusBadge registros={registros} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{unidadeExibicao}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onRegistrar(p)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-pm-700 bg-pm-50 hover:bg-pm-100 rounded-lg transition-colors"
                >
                  <Plus size={11} />
                  Registrar
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Select auxiliar ──────────────────────────────────
function FiltroSelect({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30 bg-white text-gray-700"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}

// ── Página Principal ─────────────────────────────────
export default function Policiais() {
  const [busca, setBusca] = useState('')
  const [localidade, setLocalidade] = useState('')
  const [cia, setCia] = useState('')
  const [pel, setPel] = useState('')
  const [gp, setGp] = useState('')
  const [modalPolicial, setModalPolicial] = useState(null)

  // Determina se algum filtro de agrupamento está ativo
  const filtroAtivo = !!(localidade || cia || pel || gp)

  const params = { limite: 400, ativo: true }
  if (busca) params.busca = busca
  if (localidade) params.localidade = localidade
  if (cia) params.cia = cia
  if (pel) params.pel = pel
  if (gp) params.gp = gp

  const { data: unidadesData } = useQuery({
    queryKey: ['unidades'],
    queryFn: policiaisService.unidades,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['policiais', params],
    queryFn: () => policiaisService.listar(params),
  })

  const { data: processosData } = useQuery({
    queryKey: ['policiais-processos'],
    queryFn: () => processosService.listar({ limite: 500 }),
  })

  const lista = data?.dados || []
  const { localidades = [], cias = [], pels = [], gps = [] } = unidadesData?.dados || {}
  const processos = processosData?.dados || []

  // Lookup de processos por policial
  const processosPorPolicial = processos.reduce((acc, p) => {
    const pid = p.policial?._id || p.policialInfo?._id
    if (!pid) return acc
    if (!acc[pid]) acc[pid] = []
    acc[pid].push(p)
    return acc
  }, {})

  function limparFiltros() {
    setLocalidade('')
    setCia('')
    setPel('')
    setGp('')
    setBusca('')
  }

  // Se há filtro de localidade/CIA/PEL/GP → agrupa por localidade
  // Se não → exibe lista plana em ordem de antiguidade do batalhão
  const conteudo = () => {
    if (isLoading) return (
      <div className="text-center py-16 text-sm text-gray-400">Carregando...</div>
    )
    if (!lista.length) return (
      <div className="text-center py-16 text-sm text-gray-400">Nenhum policial encontrado</div>
    )

    if (filtroAtivo) {
      // Agrupa por UNIDADE (secaoOrigem) — uma cidade pode ter várias unidades
      // (ex: 1ª CIA e PCSv são ambas de Vilhena, mas são unidades diferentes).
      // A lista já chega ordenada por antiguidade do batalhão (ordemBatalhao),
      // então a ordem de antiguidade dentro de cada unidade é preservada
      // automaticamente ao agrupar — não é preciso reordenar aqui.
      const porUnidade = lista.reduce((acc, p) => {
        const chave = p.secaoOrigem || p.localidade || 'Sem unidade'
        if (!acc[chave]) acc[chave] = { localidade: p.localidade || 'Sem localidade', pols: [] }
        acc[chave].pols.push(p)
        return acc
      }, {})

      return (
        <div className="flex flex-col gap-4">
          {Object.entries(porUnidade).map(([unidade, { localidade: loc, pols }]) => (
            <div key={unidade} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <MapPin size={14} className="text-pm-500" />
                <span className="text-sm font-medium text-gray-800">{unidade}</span>
                <span className="text-xs text-gray-400">{loc} — {pols.length} policial(is)</span>
              </div>
              <TabelaPoliciais
                pols={pols}
                processosPorPolicial={processosPorPolicial}
                onRegistrar={setModalPolicial}
              />
            </div>
          ))}
        </div>
      )
    }

    // Sem filtro de agrupamento: lista plana em ordem de antiguidade do batalhão
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <TabelaPoliciais
          pols={lista}
          processosPorPolicial={processosPorPolicial}
          onRegistrar={setModalPolicial}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Efetivo</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {lista.length} policial(is) encontrado(s)
          {!filtroAtivo && ' — ordenados por antiguidade do batalhão'}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pm-500/30"
          />
        </div>

        <FiltroSelect
          value={localidade}
          onChange={setLocalidade}
          placeholder="Todas as localidades"
          options={localidades}
        />

        <FiltroSelect
          value={cia}
          onChange={setCia}
          placeholder="Todas as CIAs"
          options={cias}
        />

        <FiltroSelect
          value={pel}
          onChange={setPel}
          placeholder="Todos os Pelotões"
          options={pels}
        />

        <FiltroSelect
          value={gp}
          onChange={setGp}
          placeholder="Todos os GPs"
          options={gps}
        />

        {(filtroAtivo || busca) && (
          <button
            onClick={limparFiltros}
            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {conteudo()}

      {modalPolicial && (
        <ModalRegistrar
          policial={modalPolicial}
          onClose={() => setModalPolicial(null)}
        />
      )}
    </div>
  )
}