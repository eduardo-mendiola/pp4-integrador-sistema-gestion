import Employee from '../models/EmployeeModel.js';
import EmployeeService from '../services/EmployeeService.js';

const EmployeeController = {
  create: async (req, res) => {
    try {
      const employee = await Employee.create(req.body);

      return res.status(201).json({
        success: true,
        data: employee
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const employees = await Employee.findAll();

      return res.json({
        success: true,
        data: employees
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getById: async (req, res) => {
    try {
      const employee = await Employee.findById(req.params.id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      return res.json({
        success: true,
        data: employee
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getByPersonId: async (req, res) => {
    try {
      const employee = await Employee.findByPersonId(req.params.personId);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found for this person'
        });
      }

      return res.json({
        success: true,
        data: employee
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  update: async (req, res) => {
    try {
      const employee = await Employee.update(req.params.id, req.body);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      return res.json({
        success: true,
        data: employee
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Employee.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      return res.json({
        success: true,
        message: 'Employee deleted'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  terminate: async (req, res) => {
    try {
      const employee = await Employee.update(req.params.id, {
        termination_date: new Date()
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      return res.json({
        success: true,
        data: employee
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  register: async (req, res) => {
    try {

      const result = await EmployeeService.registerEmployee(req.body);

      return res.status(201).json({
        success: true,
        data: result
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message
      });

    }
  },

};

export default EmployeeController;