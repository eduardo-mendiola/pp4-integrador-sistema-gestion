import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import BaseModel from './BaseModel.js';

const userSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  password_hash: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  person_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true, unique: true },

  is_temporary_role: { type: Boolean, default: false },
  role_expiration_date: { type: Date },
  role_duration_value: { type: Number },
  role_duration_unit: {
    type: String,
    enum: ['seconds', 'minutes', 'hours', 'days', 'months'],
    default: 'days'
  },
  fallback_role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },

  last_login: { type: Date },
  is_active: { type: Boolean, default: true }
}, {
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Virtual
userSchema.virtual('employee', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});


// Pre-save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();

  if (this.password_hash.startsWith('$2b$') || this.password_hash.startsWith('$2a$')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// Hide sensitive fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.__v;
  return obj;
};


// Model base
const User = mongoose.model('User', userSchema);


class UserModel extends BaseModel {
  constructor() {
    super(userSchema, 'User');
  }

  findAll() {
    return super.findAll(['role_id', 'fallback_role_id', 'person_id']);
  }

  findById(id) {
    return super.findById(id, ['role_id', 'fallback_role_id', 'person_id']);
  }

  findByUsername(username) {
    return this.model.findOne({ username }).populate('role_id person_id');
  }

  updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(
      userId,
      { last_login: new Date() },
      { new: true }
    );
  }

  async update(id, updateData) {
    if (updateData.password_hash !== undefined && updateData.password_hash.trim() === '') {
      delete updateData.password_hash;
    }

    if (updateData.password_hash) {
      if (
        !updateData.password_hash.startsWith('$2b$') &&
        !updateData.password_hash.startsWith('$2a$')
      ) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(updateData.password_hash, salt);
      }
    }

    return this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  calculateRoleExpiration(durationType, durationValue) {
    const now = new Date();
    const expiration = new Date(now);

    switch (durationType) {
      case 'seconds':
        expiration.setSeconds(expiration.getSeconds() + durationValue);
        break;
      case 'minutes':
        expiration.setMinutes(expiration.getMinutes() + durationValue);
        break;
      case 'hours':
        expiration.setHours(expiration.getHours() + durationValue);
        break;
      case 'days':
        expiration.setDate(expiration.getDate() + durationValue);
        break;
      case 'months':
        expiration.setMonth(expiration.getMonth() + durationValue);
        break;
      default:
        throw new Error(`Tipo de duración inválido: ${durationType}`);
    }

    return expiration;
  }

  findUsersWithExpiredRoles() {
    return this.model.find({
      is_temporary_role: true,
      role_expiration_date: { $lte: new Date() },
      fallback_role_id: { $ne: null }
    }).populate(['role_id', 'fallback_role_id']);
  }

  async revertToFallbackRole(userId) {
    const user = await this.model.findById(userId);

    if (!user || !user.is_temporary_role || !user.fallback_role_id) {
      return null;
    }

    user.role_id = user.fallback_role_id;
    user.is_temporary_role = false;
    user.role_expiration_date = null;
    user.role_duration_value = null;
    user.role_duration_unit = null;
    user.fallback_role_id = null;

    return user.save();
  }
}

export default new UserModel();