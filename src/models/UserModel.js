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
  
  // Campos para roles temporales
  is_temporary_role: { type: Boolean, default: false },
  role_expiration_date: { type: Date },
  role_duration_value: { type: Number }, // valor numérico (ej: 15, 30, 2)
  role_duration_unit: { 
    type: String, 
    enum: ['seconds', 'minutes', 'hours', 'days', 'months'],
    default: 'days'
  },
  fallback_role_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  
  last_login: { type: Date },
  is_active: { type: Boolean, default: true },
}, {
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para obtener el empleado asociado
userSchema.virtual('employee', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'user_id',
  justOne: true
});

// Método para hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hashear si la contraseña fue modificada (o es nueva)
  if (!this.isModified('password_hash')) return next();
  
  // Verificar que no sea ya un hash de bcrypt (evitar rehashear)
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

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

// No devolver el hash en JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  delete obj.__v;
  return obj;
};

class UserModel extends BaseModel {
  constructor() {
    super(userSchema, 'User');
  }

  async findAll() {
    return super.findAll(['role_id', 'fallback_role_id']); // populate automático
  }

  async findById(id) {
    return super.findById(id, ['role_id', 'fallback_role_id']); // populate automático
  }

  // Método para buscar por username
  async findByUsername(username) {
    return this.model.findOne({ username }).populate('role_id');
  }

  // Método para actualizar último login
  async updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(
      userId, 
      { last_login: new Date() },
      { new: true }
    );
  }

  // Sobrescribir método update para hashear contraseña si fue modificada
  async update(id, updateData) {
    console.log('🔍 UserModel.update - Datos recibidos:', updateData);
    
    // Si password_hash está vacío o solo espacios, eliminarlo del update
    if (updateData.password_hash !== undefined && updateData.password_hash.trim() === '') {
      console.log('Eliminando password_hash vacío');
      delete updateData.password_hash;
    }
    
    // Solo hashear si se está actualizando la contraseña Y no está vacía
    if (updateData.password_hash) {
      console.log('Procesando password_hash:', updateData.password_hash.substring(0, 10) + '...');
      // Verificar que no sea ya un hash de bcrypt (comienza con $2b$ o $2a$)
      if (!updateData.password_hash.startsWith('$2b$') && !updateData.password_hash.startsWith('$2a$')) {
        console.log('Hasheando nueva contraseña');
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(updateData.password_hash, salt);
      } else {
        console.log('Contraseña ya está hasheada, no rehashear');
      }
    }
    
    console.log('Actualizando usuario con:', Object.keys(updateData));
    return this.model.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  // Método para calcular la fecha de expiración del rol
  calculateRoleExpiration(durationType, durationValue) {
    const now = new Date();
    const expiration = new Date(now);
    
    switch(durationType) {
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

  // Método para buscar usuarios con roles expirados
  async findUsersWithExpiredRoles() {
    return this.model.find({
      is_temporary_role: true,
      role_expiration_date: { $lte: new Date() },
      fallback_role_id: { $ne: null }
    }).populate(['role_id', 'fallback_role_id']);
  }

  // Método para revertir un usuario a su rol de fallback
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
