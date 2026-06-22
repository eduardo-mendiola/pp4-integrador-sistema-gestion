import PaymentMethod from "../models/PaymentMethodModel.js";

const PaymentMethodController = {
  getAll: async (req, res) => {
    try {
      const data = await PaymentMethod.findAll();
      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await PaymentMethod.findById(req.params.id);

      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Payment method not found" });
      }

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = await PaymentMethod.create(req.body);
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },


  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Sanitizar: eliminar campos que NO deberían actualizarse
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      // Validar y sanitizar 'name' si se envía
      if (updateData.name !== undefined) {
        updateData.name = updateData.name.trim();
        if (!updateData.name) {
          return res
            .status(400)
            .json({
              success: false,
              message: "El nombre no puede estar vacío",
            });
        }

        // Verificar unicidad excluyendo el documento actual
        const existing = await PaymentMethod.model.findOne({
          name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
          _id: { $ne: id },
        });

        if (existing) {
          return res
            .status(409)
            .json({
              success: false,
              message: "Ya existe un método de pago con ese nombre",
            });
        }
      }

      // Validar 'surcharge_percentage' si se envía
      if (updateData.surcharge_percentage !== undefined) {
        if (
          typeof updateData.surcharge_percentage !== "number" ||
          updateData.surcharge_percentage < 0
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "surcharge_percentage debe ser un número mayor o igual a 0",
            });
        }
      }

      // Normalizar campos booleanos si se envían
      ["requires_auth", "allows_installments", "active"].forEach((field) => {
        if (updateData[field] !== undefined) {
          updateData[field] = Boolean(updateData[field]);
        }
      });

      // Usar el método patch del BaseModel
      const updatedMethod = await PaymentMethod.patch(id, updateData);

      if (!updatedMethod) {
        return res
          .status(404)
          .json({ success: false, message: "Método de pago no encontrado" });
      }

      return res.json({ success: true, data: updatedMethod });
    } catch (error) {
      console.error("Error en partialUpdate paymentMethod:", error);

      if (error.code === 11000) {
        return res
          .status(409)
          .json({
            success: false,
            message: "Ya existe un método de pago con ese nombre",
          });
      }

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
      const data = await PaymentMethod.update(req.params.id, req.body);

      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "Payment method not found" });
      }

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await PaymentMethod.delete(req.params.id);

      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Payment method not found" });
      }

      return res.json({ success: true, message: "Payment method deleted" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default PaymentMethodController;