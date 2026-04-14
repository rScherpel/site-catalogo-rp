import { useAdminAuth } from '../../hooks/useAdminAuth'

export function AdminHeader() {
  const { profile, signOut } = useAdminAuth()

  const handleSignOut = async (): Promise<void> => {
    await signOut()
    window.location.replace('/')
  }

  return (
    <header className="admin-header">
      <div>
        <strong>Administração</strong>
        <p>{profile?.email ?? 'Administrador'}</p>
      </div>

      <button type="button" className="admin-button admin-button--secondary" onClick={() => void handleSignOut()}>
        Sair
      </button>
    </header>
  )
}
