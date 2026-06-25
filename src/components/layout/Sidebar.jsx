import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, ArrowDownUp, ClipboardCheck, Users, LogOut, UserCog, BarChart2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const nav = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/policiais', icon: Users, label: 'Efetivo' },
    { to: '/fila', icon: ArrowDownUp, label: 'Fila de chegada' },
    { to: '/conferir', icon: ClipboardCheck, label: 'A conferir' },
    { to: '/processos', icon: FileText, label: 'Processos' },
    { to: '/relatorio', icon: BarChart2, label: 'Relatório mensal' },
    ...(usuario?.perfil === 'admin'
      ? [{ to: '/usuarios', icon: UserCog, label: 'Usuários' }]
      : []),
  ]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-56 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100">
        <span className="font-semibold text-sm text-gray-900">Controle PM</span>
        <p className="text-xs text-gray-400 mt-0.5">Processos SEI · 3º BPM</p>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-pm-50 text-pm-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-gray-400">Conectado como</p>
          <p className="text-sm font-medium text-gray-700 truncate font-mono">{usuario?.nomeUsuario || '—'}</p>
          <p className="text-xs text-gray-400 capitalize">{usuario?.perfil}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </aside>
  )
}