import mongoose from "mongoose";
import Employee from "../models/EmployeeModel.js";
import EmployeeService from "../services/EmployeeService.js";
import CodeGenerator from "../utils/CodeGenerator.js";

const codeGenerator = new CodeGenerator("employees");

const EmployeeController = {

  create: async (req, res) => {
    try {
      const payload = { ...req.body };

      // Generar código automático
      if (!payload.employee_code) {
        payload.employee_code = codeGenerator.generateCodeFromId(
          new mongoose.Types.ObjectId(),
          "EMP-",
        );
      }

      const employee = await Employee.create(payload);

      return res.status(201).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const employees = await Employee.findAll();

      return res.json({
        success: true,
        data: employees,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getByPersonId: async (req, res) => {
    try {
      const employee = await Employee.findByPersonId(req.params.personId);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found for this person",
        });
      }

      return res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar: eliminar campos que NO deberían actualizarse
      delete updateData._id;
      delete updateData.employee_code; // Código único, no modificable
      delete updateData.person_id; // Relación con Person, inmutable
      delete updateData.hire_date; // Fecha de ingreso, no debe cambiarse
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Trim en shift_schedule si existe
      if (updateData.shift_schedule) {
        updateData.shift_schedule = updateData.shift_schedule.trim();
      }

      // Validar termination_date si se envía (debe ser fecha válida o null)
      if (updateData.termination_date !== undefined) {
        if (
          updateData.termination_date === null ||
          updateData.termination_date === ""
        ) {
          updateData.termination_date = null;
        } else {
          const date = new Date(updateData.termination_date);
          if (isNaN(date.getTime())) {
            return res.status(400).json({
              success: false,
              message: "termination_date debe ser una fecha válida o null",
            });
          }
          updateData.termination_date = date;
        }
      }

      // Usar el método patch del BaseModel
      const updatedEmployee = await Employee.patch(id, updateData);

      if (!updatedEmployee) {
        return res.status(404).json({
          success: false,
          message: "Empleado no encontrado",
        });
      }

      return res.json({
        success: true,
        data: updatedEmployee,
      });
    } catch (error) {
      console.error("Error en partialUpdate employee:", error);

      // Manejo de errores de duplicados (ej: employee_code único)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un empleado con ese código",
        });
      }

      // Manejo de errores de validación de Mongoose
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: Object.values(error.errors).map((e) => e.message),
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const employee = await Employee.update(req.params.id, req.body);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Employee.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.json({
        success: true,
        message: "Employee deleted",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  terminate: async (req, res) => {
    try {
      const employee = await Employee.update(req.params.id, {
        termination_date: new Date(),
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      return res.json({
        success: true,
        data: employee,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  register: async (req, res) => {
    try {
      const result = await EmployeeService.registerEmployee(req.body);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default EmployeeController;
