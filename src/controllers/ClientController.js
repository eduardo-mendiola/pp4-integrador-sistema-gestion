import mongoose from 'mongoose';
import ClientModel from '../models/ClientModel.js';
import CodeGenerator from '../utils/CodeGenerator.js';

const codeGenerator = new CodeGenerator('clients');

const ClientController = {

  // Obtener todos los clientes
  getAll: async (req, res) => {
    try {

      const clients = await ClientModel.findAll();

      return res.json({
        success: true,
        data: clients
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  // Obtener cliente por ID
  getById: async (req, res) => {
    try {

      const client = await ClientModel.findById(req.params.id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.json({
        success: true,
        data: client
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  },

  // Crear cliente
  create: async (req, res) => {
    try {

      const payload = { ...req.body };

      // Generar código automático
      if (!payload.code) {
        payload.code = codeGenerator.generateCodeFromId(
          new mongoose.Types.ObjectId(),
          'CLI-'
        );
      }

      const client = await ClientModel.create(payload);

      return res.status(201).json({
        success: true,
        data: client
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  },

  // Actualizar cliente
  update: async (req, res) => {
    try {

      const client = await ClientModel.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).lean();

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.json({
        success: true,
        data: client
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  },

  // Eliminación lógica
  remove: async (req, res) => {
    try {

      const client = await ClientModel.model.findByIdAndUpdate(
        req.params.id,
        { activo: false },
        { new: true }
      );

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Cliente desactivado'
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

};

export default ClientController;