import DiscountRule from "../models/DiscountRuleModel.js";

const DiscountRuleController = {

  create: async (req, res) => {
    try {
      const rule = await DiscountRule.create(req.body);
      return res.status(201).json({ success: true, data: rule });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const rules = await DiscountRule.findAll();
      return res.json({ success: true, data: rules });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const rule = await DiscountRule.findById(req.params.id);
      if (!rule) {
        return res.status(404).json({ success: false, message: 'Regla de descuento no encontrada' });
      }
      return res.json({ success: true, data: rule });
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
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Trim en name
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }

      // Validar rangos numéricos
      if (updateData.timeWithoutSaleMonths !== undefined) {
        if (typeof updateData.timeWithoutSaleMonths !== 'number' || updateData.timeWithoutSaleMonths < 0) {
          return res.status(400).json({ success: false, message: 'timeWithoutSaleMonths debe ser un número mayor o igual a 0' });
        }
      }

      if (updateData.percentage !== undefined) {
        if (typeof updateData.percentage !== 'number' || updateData.percentage < 0 || updateData.percentage > 100) {
          return res.status(400).json({ success: false, message: 'percentage debe estar entre 0 y 100' });
        }
      }

      const updatedRule = await DiscountRule.patch(id, updateData);

      if (!updatedRule) {
        return res.status(404).json({ success: false, message: 'Regla de descuento no encontrada' });
      }

      return res.json({ success: true, data: updatedRule });

    } catch (error) {
      console.error('Error en partialUpdate discountRule:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }

      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar campos protegidos
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const updatedRule = await DiscountRule.model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedRule) {
        return res.status(404).json({ success: false, message: 'Regla de descuento no encontrada' });
      }

      return res.json({ success: true, data: updatedRule });

    } catch (error) {
      console.error('Error en update discountRule:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          errors: Object.values(error.errors).map(e => e.message)
        });
      }

      return res.status(400).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedRule = await DiscountRule.model.findByIdAndDelete(id);

      if (!deletedRule) {
        return res.status(404).json({ success: false, message: 'Regla de descuento no encontrada' });
      }

      return res.json({ success: true, message: 'Regla de descuento eliminada' });

    } catch (error) {
      console.error('Error en delete discountRule:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

};

export default DiscountRuleController;