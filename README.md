# Controle de Processos PM — Frontend

React + Vite + Tailwind CSS

## Requisitos
- Node.js 18+
- Back-end rodando em http://localhost:3000

## Instalação

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e ajuste a URL da API se necessário:

```bash
cp .env.example .env
```

## Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

## Build para produção

```bash
npm run build
npm run preview
```

## Telas

- **Dashboard** — métricas gerais, distribuição por situação/localidade e tipos mais comuns
- **Processos** — listagem completa com filtros, registro de novos processos e alteração de situação
- **Fila de chegada** — processos ordenados por data de chegada e antiguidade hierárquica
- **Efetivo** — lista de policiais agrupados por localidade
