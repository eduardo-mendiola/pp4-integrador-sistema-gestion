import Supplier from '../models/SupplierModel.js';

const SupplierController = {
  create: async (req, res) => {
    try {
      const supplier = await Supplier.create(req.body);
      return res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const suppliers = await Supplier.find({});
      return res.json({ success: true, data: suppliers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.params.id);

      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      }

      return res.json({ success: true, data: supplier });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const supplier = await Supplier.update(req.params.id, req.body);

      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      }

      return res.json({ success: true, data: supplier });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Supplier.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      }

      return res.json({ success: true, message: 'Proveedor eliminado' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default SupplierController;