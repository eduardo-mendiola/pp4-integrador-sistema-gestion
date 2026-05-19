import mongoose from 'mongoose';

import Person from '../models/PersonModel.js';
import User from '../models/UserModel.js';
import Employee from '../models/EmployeeModel.js';

class EmployeeService {

  async registerEmployee(data) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const { person, user, employee } = data;

      // =========================
      // CREATE PERSON
      // =========================

      const personDoc = await Person.create(person, { session });

      // =========================
      // CREATE USER
      // =========================

      const userDoc = await User.create(
        {
          ...user,
          person_id: personDoc._id
        },
        { session }
      );

      // =========================
      // CREATE EMPLOYEE
      // =========================

      const employeeDoc = await Employee.create(
        {
          ...employee,
          person_id: personDoc._id
        },
        { session }
      );

      // =========================
      // COMMIT
      // =========================

      await session.commitTransaction();

      return {
        person: personDoc,
        user: userDoc,
        employee: employeeDoc
      };

    } catch (error) {

      await session.abortTransaction();
      throw error;

    } finally {
      session.endSession();
    }
  }
}

export default new EmployeeService();