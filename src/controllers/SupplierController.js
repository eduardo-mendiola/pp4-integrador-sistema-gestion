import mongoose from "mongoose";
import Supplier from "../models/SupplierModel.js";
import CodeGenerator from "../utils/CodeGenerator.js";

const codeGenerator = new CodeGenerator("suppliers");

const SupplierController = {
  create: async (req, res) => {
    try {
      const payload = { ...req.body };

      // Generar código automático
      if (!payload.supplier_code) {
        payload.supplier_code = codeGenerator.generateCodeFromId(
          new mongoose.Types.ObjectId(),
          "PRO-",
        );
      }

      const supplier = await Supplier.create(payload);
      return res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const suppliers = await Supplier.findAll();
      return res.json({ success: true, data: suppliers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const supplier = await Supplier.findById(req.params.id);

      if (!supplier) {
        return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
      }

      return res.json({ success: true, data: supplier });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar campos inmutables y timestamps
      delete updateData._id;
      delete updateData.supplier_code;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Trim en campos de texto
      ["name", "contact_name", "phone", "address"].forEach((field) => {
        if (updateData[field] !== undefined) {
          updateData[field] = updateData[field].trim();
        }
      });

      // Normalizar email a minúsculas
      if (updateData.email !== undefined) {
        updateData.email = updateData.email.trim().toLowerCase();
      }

      // Validar que 'name' no esté vacío si se envía
      if (updateData.name !== undefined && !updateData.name) {
        return res.status(400).json({ success: false, message: "El nombre no puede estar vacío" });
      }

      const updatedSupplier = await Supplier.patch(id, updateData);

      if (!updatedSupplier) {
        return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
      }

      return res.json({ success: true, data: updatedSupplier });
    } catch (error) {
      console.error("Error en partialUpdate supplier:", error);

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
      const { id } = req.params;
      
      const updatedSupplier = await Supplier.model.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedSupplier) {
        return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
      }

      return res.json({ success: true, data: updatedSupplier });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // Eliminación lógica: se marca el proveedor como "CANCELADO" en lugar de eliminarlo físicamente
  remove: async (req, res) => {
    try {
      const supplier = await Supplier.model.findByIdAndUpdate(
        req.params.id,
        { status: "CANCELADO" },
        { new: true },
      );

      if (!supplier) {
        return res.status(404).json({ success: false, message: "Proveedor no encontrado" });
      }

      return res.json({ success: true, message: "Proveedor cancelado" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default SupplierController;