import mongoose from 'mongoose';
import UserModel from '../models/UserModel.js';
import RoleModel from '../models/RoleModel.js';
import CodeGenerator from '../utils/CodeGenerator.js';

const codeGenerator = new CodeGenerator('users');

const normalizePassword = (payload) => {
  if (payload.password && !payload.password_hash) {
    payload.password_hash = payload.password;
    delete payload.password;
  }

  return payload;
};

const UserController = {
  getAll: async (req, res) => {
    try {
      const users = await UserModel.model.find({})
        .populate('role_id fallback_role_id')
        .select('-password_hash')
        .sort({ created_at: -1 })
        .lean();

      return res.json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await UserModel.model.findById(req.params.id)
        .populate('role_id fallback_role_id')
        .select('-password_hash')
        .lean();

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      return res.json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const payload = normalizePassword({ ...req.body });

      if (!payload.username && payload.email) {
        payload.username = payload.email.split('@')[0];
      }

      if (!payload.code) {
        payload.code = codeGenerator.generateCodeFromId(new mongoose.Types.ObjectId(), 'USR-');
      }

      if (payload.role_id) {
        const roleExists = await RoleModel.model.exists({ _id: payload.role_id });
        if (!roleExists) {
          return res.status(400).json({ success: false, message: 'Rol inválido' });
        }
      }

      const user = await UserModel.create(payload);
      const safeUser = await UserModel.model.findById(user._id)
        .populate('role_id fallback_role_id')
        .select('-password_hash')
        .lean();

      return res.status(201).json({ success: true, data: safeUser });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const payload = normalizePassword({ ...req.body });

      if (payload.role_id) {
        const roleExists = await RoleModel.model.exists({ _id: payload.role_id });
        if (!roleExists) {
          return res.status(400).json({ success: false, message: 'Rol inválido' });
        }
      }

      const user = await UserModel.update(req.params.id, payload);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const safeUser = await UserModel.model.findById(user._id)
        .populate('role_id fallback_role_id')
        .select('-password_hash')
        .lean();

      return res.json({ success: true, data: safeUser });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await UserModel.model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      return res.json({ success: true, message: 'Usuario eliminado' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default UserController;