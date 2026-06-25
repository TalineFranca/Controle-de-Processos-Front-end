import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Processos from '@/pages/Processos'
import FilaChegada from '@/pages/FilaChegada'
import AConferir from '@/pages/AConferir'
import Policiais from '@/pages/Policiais'
import Usuarios from '@/pages/Usuarios'
import Relatorio from '@/pages/Relatorio'

import './index.css'

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } })

function PrivateRoute({ children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">Carregando...</div>
  return usuario ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.perfil !== 'admin') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="processos" element={<Processos />} />
            <Route path="fila" element={<FilaChegada />} />
            <Route path="conferir" element={<AConferir />} />
            <Route path="policiais" element={<Policiais />} />
            <Route path="usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
            <Route path="relatorio" element={<Relatorio />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="bottom-right" toastOptions={{ style: { fontSize: 13 } }} />
      </AuthProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={qc}>
    <App />
  </QueryClientProvider>
)