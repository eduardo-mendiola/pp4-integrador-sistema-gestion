import Sale from '../models/SaleModel.js';

const normalizeItems = (items) => {
  if (Array.isArray(items)) return items;
  if (typeof items === 'string' && items.trim()) return JSON.parse(items);
  return [];
};

const SaleController = {
  getAll: async (req, res) => {
    try {
      const data = await Sale.findAll(['items.product', 'created_by']);

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const sale = await Sale.findById(req.params.id, [
        'items.product',
        'created_by'
      ]);

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
      const payload = {
        ...req.body,
        items: normalizeItems(req.body.items),
        created_by: req.user?._id || req.body.created_by
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
        payload.items = normalizeItems(payload.items);
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