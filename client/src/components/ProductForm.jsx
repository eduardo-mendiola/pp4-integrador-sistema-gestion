import React, { useState } from 'react'

export default function ProductForm() {
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    supplier: '',
    age_range: '',
    price: '',
    stock: '',
    min_stock_alert: ''
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!form.name || !form.name.trim()) nextErrors.name = 'Name is required'
    const priceVal = parseFloat(form.price || 0)
    if (Number.isNaN(priceVal) || priceVal <= 0) nextErrors.price = 'Price must be a number > 0'
    const stockVal = parseInt(form.stock || 0, 10)
    if (Number.isNaN(stockVal) || stockVal < 0) nextErrors.stock = 'Stock must be a non-negative integer'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      setSubmitError('')
      return
    }

    const payload = {
      ...form,
      price: priceVal,
      stock: stockVal,
      min_stock_alert: parseInt(form.min_stock_alert || 0, 10)
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed')
      // Notify product list to refresh
      window.dispatchEvent(new CustomEvent('product:created'))
      setForm({ name: '', sku: '', category: '', supplier: '', age_range: '', price: '', stock: '', min_stock_alert: '' })
      setErrors({})
      setSubmitError('')
    } catch (err) {
      console.error(err)
      setSubmitError('Login required to create products.')
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="sku" placeholder="SKU" value={form.sku} onChange={onChange} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="category" placeholder="Category" value={form.category} onChange={onChange} />
        <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={onChange} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="age_range" placeholder="Age range" value={form.age_range} onChange={onChange} />
        <input name="price" placeholder="Price" value={form.price} onChange={onChange} />
      </div>
      {errors.price && <div style={{ color: 'crimson' }}>{errors.price}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <input name="stock" placeholder="Stock" value={form.stock} onChange={onChange} />
        <input name="min_stock_alert" placeholder="Min stock alert" value={form.min_stock_alert} onChange={onChange} />
      </div>
      {errors.stock && <div style={{ color: 'crimson' }}>{errors.stock}</div>}
      <div>
        <button type="submit">Create product</button>
      </div>
      {submitError ? <div style={{ color: 'crimson' }}>{submitError}</div> : null}
    </form>
  )
}
