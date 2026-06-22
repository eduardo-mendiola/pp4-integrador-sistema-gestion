import mongoose from "mongoose";
import ClientModel from "../models/ClientModel.js";
import CodeGenerator from "../utils/CodeGenerator.js";

const codeGenerator = new CodeGenerator("clients");

const ClientController = {
  // Obtener todos los clientes
  getAll: async (req, res) => {
    try {
      const clients = await ClientModel.findAll();

      return res.json({
        success: true,
        data: clients,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Obtener cliente por ID
  getById: async (req, res) => {
    try {
      const client = await ClientModel.findById(req.params.id);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Crear cliente
  create: async (req, res) => {
    try {
      const payload = { ...req.body };

      // Generar código automático
      if (!payload.client_code) {
        payload.client_code = codeGenerator.generateCodeFromId(
          new mongoose.Types.ObjectId(),
          "CLI-",
        );
      }

      const client = await ClientModel.create(payload);

      return res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar: eliminar campos que no deberían actualizarse
      delete updateData._id;
      delete updateData.code;
      delete updateData.document_type;
      delete updateData.document_number;
      delete updateData.created_at;
      delete updateData.updated_at;

      // Trim en campos string simples
      ["first_name", "last_name", "email", "phone", "business_name"].forEach(
        (field) => {
          if (updateData[field]) updateData[field] = updateData[field].trim();
        },
      );

      // Trim en campos del address si existe
      if (updateData.address && typeof updateData.address === "object") {
        ["street", "number", "city", "state", "postal_code", "country"].forEach(
          (field) => {
            if (updateData.address[field] !== undefined) {
              updateData.address[field] =
                updateData.address[field]?.toString().trim() || "";
            }
          },
        );

        const currentClient = await ClientModel.model.findById(id);
        if (currentClient?.address) {
          updateData.address = {
            ...currentClient.address.toObject(),
            ...updateData.address,
          };
        }
      }

      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      // Usar el método patch del BaseModel
      const updatedClient = await ClientModel.patch(id, updateData);

      if (!updatedClient) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.json({
        success: true,
        data: updatedClient,
      });
    } catch (error) {
      console.error("Error en partialUpdate client:", error);

      // Manejo de errores de duplicados (ej: email único si lo tuvieras)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Ya existe un cliente con esos datos",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Actualizar cliente
  update: async (req, res) => {
    try {
      const client = await ClientModel.model
        .findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        })
        .lean();

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Eliminación lógica
  remove: async (req, res) => {
    try {
      const client = await ClientModel.model.findByIdAndUpdate(
        req.params.id,
        { active: false },
        { new: true },
      );

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Cliente no encontrado",
        });
      }

      return res.json({
        success: true,
        message: "Cliente desactivado",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

export default ClientController;