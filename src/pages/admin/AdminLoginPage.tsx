import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { loading, signIn, error: authError } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) {
    return <div className="admin-login"><p>Carregando sessão...</p></div>
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)
    setBusy(true)

    try {
      await signIn(email, password)
      navigate('/admin/dashboard', { replace: true })
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Falha no login.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={(event) => void handleSubmit(event)}>
        <h1>Login administrativo</h1>
        <p>Acesso restrito ao administrador do catálogo.</p>

        {authError ? <p className="admin-form__error">{authError}</p> : null}

        <label className="admin-field">
          <span>Email</span>
          <input className="admin-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="admin-field">
          <span>Senha</span>
          <input className="admin-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>

        {error ? <p className="admin-form__error">{error}</p> : null}

        <button type="submit" className="admin-button admin-button--primary" disabled={busy}>
          {busy ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
