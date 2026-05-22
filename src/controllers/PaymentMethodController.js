import PaymentMethod from '../models/PaymentMethodModel.js';

const PaymentMethodController = {

  getAll: async (req, res) => {
    try {
      const data = await PaymentMethod.findAll();
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await PaymentMethod.findById(req.params.id);

      if (!data) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await PaymentMethod.create(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = await PaymentMethod.update(req.params.id, req.body);

      if (!data) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await PaymentMethod.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Payment method not found' });
      }

      return res.json({ success: true, message: 'Payment method deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default PaymentMethodController;