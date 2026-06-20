import mongoose from 'mongoose';
import CodeGenerator from '../utils/CodeGenerator.js';
import Person from '../models/PersonModel.js';
import User from '../models/UserModel.js';
import Employee from '../models/EmployeeModel.js';

const userCodeGenerator = new CodeGenerator("users");
const employeeCodeGenerator = new CodeGenerator("employees");

class EmployeeService {
  async registerEmployee(data) {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      const { person, user, employee, person_id } = data;
      let personDoc;

      // 1. PERSONA - Verificar si existe o crear nueva
      if (person_id) {
        // Usar persona existente
        personDoc = await Person.model.findById(person_id).session(session);
        if (!personDoc) {
          throw new Error('Persona no encontrada');
        }
      } else if (person) {
        // Crear nueva persona
        personDoc = await Person.model.create([person], { session });
        personDoc = personDoc[0];
      } else {
        throw new Error('Debe proporcionar person_id o datos de persona');
      }

      // 2. USUARIO - Generar código único
      const userCode = userCodeGenerator.generateCodeFromId(
        new mongoose.Types.ObjectId(),
        "USR-"
      );
      
      const userData = {
        ...user,
        code: userCode,
        person_id: personDoc._id
      };
      const userDoc = await User.model.create([userData], { session });
      const createdUser = userDoc[0];

      // 3. EMPLEADO - Generar código único
      const employeeCode = employeeCodeGenerator.generateCodeFromId(
        new mongoose.Types.ObjectId(),
        "EMP-"
      );
      
      const employeeData = {
        ...employee,
        employee_code: employeeCode,
        person_id: personDoc._id
      };
      const employeeDoc = await Employee.model.create([employeeData], { session });
      const createdEmployee = employeeDoc[0];

      await session.commitTransaction();

      return {
        person: personDoc,
        user: createdUser,
        employee: createdEmployee
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