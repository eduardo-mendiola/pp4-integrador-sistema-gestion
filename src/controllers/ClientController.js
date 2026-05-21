import mongoose from 'mongoose';
import ClientModel from '../models/ClientModel.js';
import CodeGenerator from '../utils/CodeGenerator.js';

const codeGenerator = new CodeGenerator('clients');

const ClientController = {
  getAll: async (req, res) => {
    try {
      const clients = await ClientModel.model.find({}).sort({ created_at: -1 }).lean();
      return res.json({ success: true, data: clients });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const client = await ClientModel.model.findById(req.params.id).lean();
      if (!client) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      }
      return res.json({ success: true, data: client });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const payload = { ...req.body };
      if (!payload.code) {
        payload.code = codeGenerator.generateCodeFromId(new mongoose.Types.ObjectId(), 'CLI-');
      }
      const client = await ClientModel.model.create(payload);
      return res.status(201).json({ success: true, data: client });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const client = await ClientModel.model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      }).lean();

      if (!client) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      }

      return res.json({ success: true, data: client });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await ClientModel.model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
      }
      return res.json({ success: true, message: 'Cliente eliminado' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default ClientController;