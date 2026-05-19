import mongoose from 'mongoose';
import BaseModel from './BaseModel.js';

const employeeSchema = new mongoose.Schema({
  employee_code: { type: String, required: true, unique: true, trim: true },

  person_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
    required: true,
    unique: true
  },

  hire_date: { type: Date, required: true },

  termination_date: { type: Date, default: null },

  shift_schedule: { type: String, required: true }
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
    return this.model.find({ termination_date: null });
  }

  findInactive() {
    return this.model.find({ termination_date: { $ne: null } });
  }
}

export default new EmployeeModel();