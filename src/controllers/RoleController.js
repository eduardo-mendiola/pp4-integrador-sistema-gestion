// controllers/RoleController.js
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
  },

  create: async (req, res) => {
    try {
      const { name, description, permissions, is_active } = req.body;
      
      const roleData = {
        name: name?.trim(),
        description: description?.trim(),
        permissions: Array.isArray(permissions) ? permissions : [],
        is_active: is_active !== undefined ? Boolean(is_active) : true
      };

      if (!roleData.name) {
        return res.status(400).json({ success: false, message: 'El nombre del rol es requerido' });
      }

      const role = await RoleModel.create(roleData);
      return res.status(201).json({ success: true, data: role });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Ya existe un rol con ese nombre' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar campos inmutables
      delete updateData._id;
      delete updateData.created_at;
      delete updateData.updated_at;

      // Validar y sanitizar 'name'
      if (updateData.name !== undefined) {
        updateData.name = updateData.name.trim();
        if (!updateData.name) {
          return res.status(400).json({ success: false, message: 'El nombre no puede estar vacío' });
        }
        const existing = await RoleModel.model.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
          _id: { $ne: id }
        });
        if (existing) {
          return res.status(409).json({ success: false, message: 'Ya existe un rol con ese nombre' });
        }
      }

      if (updateData.description !== undefined) updateData.description = updateData.description.trim();
      
      if (updateData.permissions !== undefined) {
        updateData.permissions = Array.isArray(updateData.permissions) ? updateData.permissions : [];
      }

      if (updateData.is_active !== undefined) {
        updateData.is_active = Boolean(updateData.is_active);
      }

      const updatedRole = await RoleModel.patch(id, updateData);
      if (!updatedRole) {
        return res.status(404).json({ success: false, message: 'Rol no encontrado' });
      }

      return res.json({ success: true, data: updatedRole });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Ya existe un rol con ese nombre' });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      delete updateData._id;
      delete updateData.created_at;
      delete updateData.updated_at;

      if (updateData.name) updateData.name = updateData.name.trim();
      if (updateData.description) updateData.description = updateData.description.trim();
      if (!Array.isArray(updateData.permissions)) updateData.permissions = [];
      updateData.is_active = Boolean(updateData.is_active);

      const updatedRole = await RoleModel.model.findByIdAndUpdate(
        id, { $set: updateData }, { new: true, runValidators: true }
      );

      if (!updatedRole) {
        return res.status(404).json({ success: false, message: 'Rol no encontrado' });
      }

      return res.json({ success: true, data: updatedRole });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Ya existe un rol con ese nombre' });
      }
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await RoleModel.model.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Rol no encontrado' });
      }

      return res.json({ success: true, message: 'Rol eliminado correctamente' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default RoleController;