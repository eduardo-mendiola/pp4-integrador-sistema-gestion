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

      // Trim en campos de texto
      ["shift_schedule", "status_reason", "status_comments", "termination_reason", "termination_comments"].forEach((field) => {
        if (updateData[field]) {
          updateData[field] = updateData[field].trim();
        }
      });

      // ===== VALIDACIONES DE ESTADO DEL CONTRATO =====
      if (updateData.contract_status !== undefined) {
        const validContractStatuses = ['active', 'terminated'];
        if (!validContractStatuses.includes(updateData.contract_status)) {
          return res.status(400).json({
            success: false,
            message: "contract_status debe ser 'active' o 'terminated'"
          });
        }

        // Si está terminado, fecha y motivo son obligatorios
        if (updateData.contract_status === 'terminated') {
          if (!updateData.termination_date) {
            return res.status(400).json({
              success: false,
              message: "termination_date es obligatorio cuando el contrato está terminado"
            });
          }
          if (!updateData.termination_reason) {
            return res.status(400).json({
              success: false,
              message: "termination_reason es obligatorio cuando el contrato está terminado"
            });
          }

          // AUTOMÁTICO: Si el contrato termina, el empleado queda inactivo con motivo "fin de contrato"
          updateData.status = 'inactive';
          updateData.status_reason = 'contract_end';
          updateData.status_comments = null;
        }

        // Si está activo, limpiar datos de terminación
        if (updateData.contract_status === 'active') {
          updateData.termination_date = null;
          updateData.termination_reason = null;
          updateData.termination_comments = null;
          
          // Si el contrato vuelve a estar activo, el empleado también (a menos que explícitamente se setee como inactivo)
          if (updateData.status === undefined) {
            updateData.status = 'active';
            updateData.status_reason = null;
            updateData.status_comments = null;
          }
        }
      }

      // ===== VALIDACIONES DE ESTADO DEL EMPLEADO =====
      // Solo validar si el contrato NO está terminado (porque si está terminado, ya se setea automáticamente)
      if (updateData.status !== undefined && updateData.contract_status !== 'terminated') {
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            success: false,
            message: "status debe ser 'active' o 'inactive'"
          });
        }

        // Si está inactivo, el motivo es obligatorio
        if (updateData.status === 'inactive' && !updateData.status_reason) {
          return res.status(400).json({
            success: false,
            message: "status_reason es obligatorio cuando el estado es 'inactive'"
          });
        }

        // Si está activo, limpiar motivo y comentarios
        if (updateData.status === 'active') {
          updateData.status_reason = null;
          updateData.status_comments = null;
        }
      }

      // Validar status_reason si se envía (solo si el contrato no está terminado)
      if (updateData.status_reason !== undefined && updateData.contract_status !== 'terminated') {
        const validStatusReasons = ['license', 'suspension', 'medical_leave', 'maternity_leave', 'contract_end', 'other', null];
        if (updateData.status_reason !== null && !validStatusReasons.includes(updateData.status_reason)) {
          return res.status(400).json({
            success: false,
            message: "status_reason inválido"
          });
        }
      }

      // Validar termination_date si se envía
      if (updateData.termination_date !== undefined) {
        if (updateData.termination_date === null || updateData.termination_date === "") {
          updateData.termination_date = null;
        } else {
          const date = new Date(updateData.termination_date);
          if (isNaN(date.getTime())) {
            return res.status(400).json({
              success: false,
              message: "termination_date debe ser una fecha válida o null"
            });
          }
          updateData.termination_date = date;
        }
      }

      // Validar termination_reason si se envía
      if (updateData.termination_reason !== undefined) {
        const validTerminationReasons = ['resignation', 'dismissal', 'retirement', 'contract_end', 'mutual_agreement', 'other', null];
        if (updateData.termination_reason !== null && !validTerminationReasons.includes(updateData.termination_reason)) {
          return res.status(400).json({
            success: false,
            message: "termination_reason inválido"
          });
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

      // Manejo de errores de duplicados
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
      const { id } = req.params;
      const { termination_date, termination_reason, termination_comments } = req.body;

      // Validaciones
      if (!termination_date) {
        return res.status(400).json({
          success: false,
          message: "termination_date es obligatorio"
        });
      }

      if (!termination_reason) {
        return res.status(400).json({
          success: false,
          message: "termination_reason es obligatorio"
        });
      }

      const validReasons = ['resignation', 'dismissal', 'retirement', 'contract_end', 'mutual_agreement', 'other'];
      if (!validReasons.includes(termination_reason)) {
        return res.status(400).json({
          success: false,
          message: "termination_reason inválido"
        });
      }

      const employee = await Employee.patch(id, {
        contract_status: 'terminated',
        termination_date: new Date(termination_date),
        termination_reason,
        termination_comments: termination_comments || null,
        // AUTOMÁTICO: Si el contrato termina, el empleado queda inactivo con motivo "fin de contrato"
        status: 'inactive',
        status_reason: 'contract_end',
        status_comments: null
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