import Person from "../models/PersonModel.js";
import User from "../models/UserModel.js";
import Employee from "../models/EmployeeModel.js";

const PersonController = {
  create: async (req, res) => {
    try {
      const person = await Person.create(req.body);

      return res.status(201).json({
        success: true,
        data: person,
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
      const persons = await Person.findAll();

      // Obtener todos los usuarios y empleados para verificar relaciones
      const [users, employees] = await Promise.all([
        User.model.find({}).select("person_id").lean(),
        Employee.model.find({}).select("person_id").lean(),
      ]);

      // Crear mapas para búsqueda rápida (con validación)
      const userMap = new Map();
      users.forEach((u) => {
        if (u.person_id) {
          userMap.set(u.person_id.toString(), u);
        }
      });

      const employeeMap = new Map();
      employees.forEach((e) => {
        if (e.person_id) {
          employeeMap.set(e.person_id.toString(), e);
        }
      });

      // Agregar información de relaciones a cada persona
      const personsWithRelations = persons.map((person) => {
        const personObj = person.toObject ? person.toObject() : person;
        const personId = personObj._id?.toString();

        return {
          ...personObj,
          has_user: personId ? userMap.has(personId) : false,
          user_id: personId ? userMap.get(personId)?._id || null : null,
          is_employee: personId ? employeeMap.has(personId) : false,
          employee_id: personId ? employeeMap.get(personId)?._id || null : null,
        };
      });

      return res.json({
        success: true,
        data: personsWithRelations,
      });
    } catch (error) {
      console.error("Error en getAll persons:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const person = await Person.findById(req.params.id);

      if (!person) {
        return res.status(404).json({
          success: false,
          message: "Persona no encontrada",
        });
      }

      return res.json({
        success: true,
        data: person,
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

      // Sanitizar campos protegidos/identificadores
      delete updateData._id;
      delete updateData.dni; // Identificador único, no modificable
      delete updateData.created_at;
      delete updateData.updated_at;

      // Trim en campos de texto simples
      ["first_name", "last_name", "email", "phone"].forEach((field) => {
        if (updateData[field]) updateData[field] = updateData[field].trim();
      });

      // Normalizar email a minúsculas
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      // Merge del subdocumento address para no perder campos no enviados
      if (updateData.address && typeof updateData.address === "object") {
        ["street", "number", "neighborhood", "city"].forEach((field) => {
          if (updateData.address[field] !== undefined) {
            updateData.address[field] =
              updateData.address[field]?.toString().trim() || "";
          }
        });

        // Obtener address actual y combinarlo con el enviado
        const currentPerson = await Person.model.findById(id);
        if (currentPerson?.address) {
          updateData.address = {
            ...currentPerson.address.toObject(),
            ...updateData.address,
          };
        }
      }

      // Usar el método patch del BaseModel
      const updatedPerson = await Person.patch(id, updateData);

      if (!updatedPerson) {
        return res
          .status(404)
          .json({ success: false, message: "Persona no encontrada" });
      }

      return res.json({ success: true, data: updatedPerson });
    } catch (error) {
      console.error("Error en partialUpdate person:", error);

      // Error de unicidad (DNI único)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Ya existe una persona con ese DNI",
        });
      }

      // Error de validación de Mongoose
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: Object.values(error.errors).map((e) => e.message),
        });
      }

      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const person = await Person.update(req.params.id, req.body);

      if (!person) {
        return res.status(404).json({
          success: false,
          message: "Persona no encontrada",
        });
      }

      return res.json({
        success: true,
        data: person,
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
      const deleted = await Person.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Persona no encontrada",
        });
      }

      return res.json({
        success: true,
        message: "Persona eliminada",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default PersonController;
