import mongoose from "mongoose";
import Product from "../models/ProductModel.js";

const ProductController = {
  create: async (req, res) => {
    try {
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const products = await Product.findAll(["category", "supplier"]);
      return res.json({ success: true, data: products });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id, [
        "category",
        "supplier",
      ]);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Producto no encontrado" });
      }

      return res.json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getUniqueBrands: async (req, res) => {
    try {
      const Product = (await import("../models/ProductModel.js")).default;
      const brands = await Product.getUniqueBrands();
      return res.json({ success: true, data: brands });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar campos protegidos
      delete updateData._id;
      delete updateData.created_at;
      delete updateData.updated_at;

      // Trim en campos de texto
      ["name", "sku", "age_range"].forEach((field) => {
        if (updateData[field] !== undefined) {
          updateData[field] = updateData[field]?.toString().trim() || "";
        }
      });

      // Validar campos numéricos (deben ser >= 0)
      ["price", "stock", "min_stock_alert"].forEach((field) => {
        if (updateData[field] !== undefined) {
          const val = Number(updateData[field]);
          if (isNaN(val) || val < 0) {
            return res.status(400).json({
              success: false,
              message: `${field} debe ser un número mayor o igual a 0`,
            });
          }
          updateData[field] = val;
        }
      });

      // Validar que category y supplier sean ObjectIds válidos si se envían
      ["category", "supplier"].forEach((field) => {
        if (updateData[field] !== undefined && updateData[field] !== null) {
          if (!mongoose.Types.ObjectId.isValid(updateData[field])) {
            return res.status(400).json({
              success: false,
              message: `${field} debe ser un ID válido`,
            });
          }
        }
      });

      // Usar el método patch del BaseModel
      const updatedProduct = await Product.patch(id, updateData);

      if (!updatedProduct) {
        return res
          .status(404)
          .json({ success: false, message: "Producto no encontrado" });
      }

      return res.json({ success: true, data: updatedProduct });
    } catch (error) {
      console.error("Error en partialUpdate product:", error);

      // Error de validación de Mongoose
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Error de validación",
          errors: Object.values(error.errors).map((e) => e.message),
        });
      }

      // Error de referencia inválida (PathNotValidated)
      if (error.name === "CastError" && error.kind === "ObjectId") {
        return res.status(400).json({
          success: false,
          message: "ID de categoría o proveedor inválido",
        });
      }

      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const product = await Product.update(req.params.id, req.body);

      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Producto no encontrado" });
      }

      return res.json({ success: true, data: product });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Product.delete(req.params.id);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Producto no encontrado" });
      }

      return res.json({ success: true, message: "Producto eliminado" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

};

export default ProductController;