import Category from "../models/CategoryModel.js";

const CategoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await Category.findAll();
      return res.json({ success: true, data: categories });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);

      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Categoría no encontrada" });
      }

      return res.json({ success: true, data: category });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const category = await Category.create(req.body);
      return res.status(201).json({ success: true, data: category });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const category = await Category.update(req.params.id, req.body);

      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Categoría no encontrada" });
      }

      return res.json({ success: true, data: category });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar: eliminar campos que no deberían actualizarse
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Trim en campos string si existen
      if (updateData.name) updateData.name = updateData.name.trim();
      if (updateData.description !== undefined) {
        updateData.description = updateData.description?.trim() || "";
      }

      // Si se actualiza el nombre, validar unicidad (excluyendo el doc actual)
      if (updateData.name) {
        const existing = await Category.model.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
          _id: { $ne: id },
        });

        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Ya existe una categoría con ese nombre",
          });
        }
      }

      // Usar el método patch del BaseModel
      const updatedCategory = await Category.patch(id, updateData);

      if (!updatedCategory) {
        return res.status(404).json({
          success: false,
          message: "Categoría no encontrada",
        });
      }

      return res.json({ success: true, data: updatedCategory });
    } catch (error) {
      console.error("Error en partialUpdate:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Category.delete(req.params.id);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Categoría no encontrada" });
      }

      return res.json({ success: true, message: "Categoría eliminada" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default CategoryController;
