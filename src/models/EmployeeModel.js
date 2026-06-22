import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const employeeSchema = new mongoose.Schema({
  employee_code: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },

  person_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
    unique: true
  },

  hire_date: { 
    type: Date, 
    required: true 
  },

  shift_schedule: { 
    type: String, 
    required: true 
  },

  // Estado del empleado (activo/inactivo, licencias, etc.) ---
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },

  status_reason: {
    type: String,
    enum: ['license', 'suspension', 'medical_leave', 'maternity_leave', 'contract_end', 'other', null],
    default: null
  },

  status_comments: {
    type: String,
    trim: true,
    default: null
  },

  // Estado del contrato (vigente/terminado) ---
  contract_status: {
    type: String,
    enum: ['active', 'terminated'],
    default: 'active'
  },

  termination_date: { 
    type: Date, 
    default: null 
  },

  termination_reason: {
    type: String,
    enum: ['resignation', 'dismissal', 'retirement', 'contract_end', 'mutual_agreement', 'other', null],
    default: null
  },

  termination_comments: {
    type: String,
    trim: true,
    default: null
  }

}, {
  collection: 'employees',
  timestamps: true
});

class EmployeeModel extends BaseModel {
  constructor() {
    super(employeeSchema, 'Employee');
  }

  findById(id) {
    return super.findById(id, ['person_id']);
  }

  findByPersonId(personId) {
    return this.model.findOne({ person_id: personId }).populate('person_id');
  }

  findAll() {
    return super.findAll(['person_id']);
  }

  findActive() {
    return this.model.find({ contract_status: 'active', status: 'active' });
  }

  findInactive() {
    return this.model.find({ $or: [{ status: 'inactive' }, { contract_status: 'terminated' }] });
  }
}

export default new EmployeeModel();