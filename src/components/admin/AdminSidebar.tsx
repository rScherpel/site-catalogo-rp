import { NavLink } from 'react-router-dom'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'admin-nav__link admin-nav__link--active' : 'admin-nav__link'

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <strong>Backoffice</strong>
        <span>Catálogo da Cidade</span>
      </div>

      <nav className="admin-nav">
        <NavLink className={linkClass} to="/admin/dashboard">
          Dashboard
        </NavLink>
        <NavLink className={linkClass} to="/admin/establishments">
          Estabelecimentos
        </NavLink>
        <NavLink className={linkClass} to="/admin/categories">
          Categorias
        </NavLink>
        <NavLink className={linkClass} to="/admin/accesses">
          Acessos
        </NavLink>
      </nav>
    </aside>
  )
}
