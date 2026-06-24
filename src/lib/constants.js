export const SIT_LABEL = {
  recebido: 'Recebido',
  em_analise: 'Em análise',
  pendente_documentacao: 'Pend. documentação',
  aguardando_despacho: 'Ag. despacho',
  enviado_ao_setor: 'Enviado ao setor',
  concluido: 'Concluído',
  arquivado: 'Arquivado',
  devolvido: 'Devolvido',
}

export const SIT_COLOR = {
  recebido: 'bg-blue-100 text-blue-700',
  em_analise: 'bg-amber-100 text-amber-700',
  pendente_documentacao: 'bg-red-100 text-red-700',
  aguardando_despacho: 'bg-orange-100 text-orange-700',
  enviado_ao_setor: 'bg-teal-100 text-teal-700',
  concluido: 'bg-green-100 text-green-700',
  arquivado: 'bg-gray-100 text-gray-600',
  devolvido: 'bg-red-100 text-red-700',
}

export const TIPOS_PROCESSO = [
  'FÉRIAS', 'LICENÇA PRÊMIO', 'LICENÇA MÉDICA', 'LICENÇA ESPECIAL',
  'PROMOÇÃO', 'TRANSFERÊNCIA', 'PENSÃO', 'REVISÃO SALARIAL',
  'INDENIZAÇÃO', 'SINDICÂNCIA', 'PAD', 'MEDALHA/ELOGIO', 'OUTROS',
]

export const SITUACOES_PROCESSO = Object.keys(SIT_LABEL)
