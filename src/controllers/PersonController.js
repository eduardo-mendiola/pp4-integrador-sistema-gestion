import Person from '../models/PersonModel.js';

const PersonController = {
  create: async (req, res) => {
    try {
      const person = await Person.create(req.body);

      return res.status(201).json({
        success: true,
        data: person
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const persons = await Person.findAll();

      return res.json({
        success: true,
        data: persons
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const person = await Person.findById(req.params.id);

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      return res.json({
        success: true,
        data: person
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const person = await Person.update(req.params.id, req.body);

      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      return res.json({
        success: true,
        data: person
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Person.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      return res.json({
        success: true,
        message: 'Persona eliminada'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default PersonController;