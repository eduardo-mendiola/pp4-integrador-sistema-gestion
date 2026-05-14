import mongoose from 'mongoose'
import BaseModel from './BaseModel.js'

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  permissions: [{ type: String }],
  is_active: { type: Boolean, default: true }
}, {
  collection: 'roles',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

class RoleModel extends BaseModel {
  constructor() {
    super(roleSchema, 'Role')
  }
}

export default new RoleModel()
