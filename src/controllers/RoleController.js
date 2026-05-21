import RoleModel from '../models/RoleModel.js';

const RoleController = {
  getAll: async (req, res) => {
    try {
      const roles = await RoleModel.model.find({}).sort({ created_at: -1 }).lean();
      return res.json({ success: true, data: roles });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const role = await RoleModel.model.findById(req.params.id).lean();
      if (!role) {
        return res.status(404).json({ success: false, message: 'Rol no encontrado' });
      }

      return res.json({ success: true, data: role });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default RoleController;