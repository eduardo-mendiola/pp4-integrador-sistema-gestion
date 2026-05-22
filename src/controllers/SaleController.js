import Sale from '../models/SaleModel.js';

const normalizeItems = (items) => {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string' && items.trim()) return JSON.parse(items);
  return [];
};

const normalizePayments = (payments) => {
  if (Array.isArray(payments)) return payments;
  if (typeof payments === 'string' && payments.trim()) return JSON.parse(payments);
  return [];
};

const SaleController = {

  getAll: async (req, res) => {
    try {
      const data = await Sale.findAll();
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id);

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      return res.json({ success: true, data: sale });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const items = normalizeItems(req.body.items);

      const normalizedItems = items.map(item => ({
        ...item,
        subtotal: item.quantity * item.price
      }));

      const total = normalizedItems.reduce((acc, i) => acc + i.subtotal, 0);

      const payments = normalizePayments(req.body.payments);

      const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);

      const payload = {
        ...req.body,
        items: normalizedItems,
        payments,
        total,
        status: paidAmount >= total ? 'PAID' : 'PENDING',
        employee_id: req.user?._id || req.body.employee_id
      };

      const sale = await Sale.create(payload);

      return res.status(201).json({ success: true, data: sale });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const payload = { ...req.body };

      if (payload.items !== undefined) {
        const items = normalizeItems(payload.items);

        payload.items = items.map(item => ({
          ...item,
          subtotal: item.quantity * item.price
        }));

        payload.total = payload.items.reduce((acc, i) => acc + i.subtotal, 0);
      }

      if (payload.payments !== undefined) {
        const payments = normalizePayments(payload.payments);

        payload.payments = payments;

        const paidAmount = payments.reduce((acc, p) => acc + p.amount, 0);
        const total = payload.total || 0;

        payload.status = paidAmount >= total ? 'PAID' : 'PENDING';
      }

      const sale = await Sale.update(req.params.id, payload);

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      return res.json({ success: true, data: sale });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Sale.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      return res.json({ success: true, message: 'Venta eliminada' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default SaleController;