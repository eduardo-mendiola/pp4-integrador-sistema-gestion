import React, { useState } from 'react'

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Login failed')
      }

      window.dispatchEvent(new CustomEvent('auth:changed', { detail: data.user }))
      onLogin?.(data.user)
    } catch (loginError) {
      setError(loginError.message)
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email or username"
        autoComplete="username"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
        autoComplete="current-password"
      />
      <button type="submit">Login</button>
      {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
    </form>
  )
}
