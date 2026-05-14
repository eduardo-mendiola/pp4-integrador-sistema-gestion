import React, { useEffect, useState } from 'react'

export default function ProductList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/products', { credentials: 'include' })
      if (res.status === 401) {
        setItems([])
        setError('Login required to view products.')
        return
      }
      const data = await res.json()
      setItems(Array.isArray(data) ? data : (data.data || data.items || []))
    } catch (err) {
      console.error(err)
      setItems([])
      setError('Unable to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    const onCreated = () => fetchItems()
    const onAuthChanged = () => fetchItems()
    window.addEventListener('product:created', onCreated)
    window.addEventListener('auth:changed', onAuthChanged)
    return () => {
      window.removeEventListener('product:created', onCreated)
      window.removeEventListener('auth:changed', onAuthChanged)
    }
  }, [])

  if (loading) return <div>Loading...</div>

  if (error) return <div style={{ color: 'crimson' }}>{error}</div>

  if (!items.length) return <div>No products yet.</div>

  return (
    <table border={1} cellPadding={6} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>SKU</th>
          <th>Category</th>
          <th>Supplier</th>
          <th>Price</th>
          <th>Stock</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p._id || p.id}>
            <td>{p.name}</td>
            <td>{p.sku}</td>
            <td>{p.category}</td>
            <td>{p.supplier}</td>
            <td>{p.price}</td>
            <td>{p.stock}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
