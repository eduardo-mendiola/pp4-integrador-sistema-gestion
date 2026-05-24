import mongoose from "mongoose";
import UserModel from "../models/UserModel.js";
import PersonModel from "../models/PersonModel.js";
import RoleModel from "../models/RoleModel.js";
import CodeGenerator from "../utils/CodeGenerator.js";

const codeGenerator = new CodeGenerator("users");

const normalizePassword = (payload) => {
  if (payload.password && !payload.password_hash) {
    payload.password_hash = payload.password;
    delete payload.password;
  }

  return payload;
};

const resolvePersonId = async (payload) => {
  if (payload.person_id) {
    return payload.person_id;
  }

  if (!payload.email) {
    return null;
  }

  const person = await PersonModel.model
    .findOne({
      email: payload.email.toLowerCase(),
    })
    .select("_id")
    .lean();

  return person?._id ?? null;
};

const UserController = {
  getAll: async (req, res) => {
    try {
      const users = await UserModel.model
        .find({})
        .populate("role_id fallback_role_id person_id")
        .select("-password_hash")
        .sort({ created_at: -1 })
        .lean();

      return res.json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await UserModel.model
        .findById(req.params.id)
        .populate("role_id fallback_role_id person_id")
        .select("-password_hash")
        .lean();

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      return res.json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const payload = normalizePassword({ ...req.body });

      if (!payload.username && payload.email) {
        payload.username = payload.email.split("@")[0];
      }

      if (!payload.code) {
        payload.code = codeGenerator.generateCodeFromId(
          new mongoose.Types.ObjectId(),
          "USR-",
        );
      }

      payload.person_id = await resolvePersonId(payload);

      if (!payload.person_id) {
        return res.status(400).json({
          success: false,
          message:
            "person_id es obligatorio y no se pudo resolver automáticamente desde el email",
        });
      }

      if (payload.role_id) {
        const roleExists = await RoleModel.model.exists({
          _id: payload.role_id,
        });
        if (!roleExists) {
          return res
            .status(400)
            .json({ success: false, message: "Rol inválido" });
        }
      }

      const personExists = await PersonModel.model.exists({
        _id: payload.person_id,
      });
      if (!personExists) {
        return res
          .status(400)
          .json({ success: false, message: "Persona inválida" });
      }

      const user = await UserModel.create(payload);
      const safeUser = await UserModel.model
        .findById(user._id)
        .populate("role_id fallback_role_id person_id")
        .select("-password_hash")
        .lean();

      return res.status(201).json({ success: true, data: safeUser });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  // controllers/UserController.js

  partialUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Campos PROHIBIDOS para actualización parcial (identidad del usuario)
      const protectedFields = [
        "_id",
        "code",
        "username",
        "email",
        "person_id",
        "created_at",
        "updated_at",
      ];
      protectedFields.forEach((field) => delete updateData[field]);

      // Manejo de contraseña: normalizar y hashear si se envía
      // IMPORTANTE: El hook pre('save') NO se ejecuta con findByIdAndUpdate, por eso hasheamos manualmente
      if (updateData.password !== undefined) {
        if (updateData.password.trim() === "") {
          delete updateData.password;
        } else {
          if (
            !updateData.password.startsWith("$2b$") &&
            !updateData.password.startsWith("$2a$")
          ) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(
              updateData.password,
              salt,
            );
          } else {
            updateData.password_hash = updateData.password;
          }
          delete updateData.password;
        }
      }

      // Si se envía password_hash directamente, validar formato y hashear si es necesario
      if (updateData.password_hash !== undefined) {
        if (updateData.password_hash.trim() === "") {
          delete updateData.password_hash;
        } else if (
          !updateData.password_hash.startsWith("$2b$") &&
          !updateData.password_hash.startsWith("$2a$")
        ) {
          const salt = await bcrypt.genSalt(10);
          updateData.password_hash = await bcrypt.hash(
            updateData.password_hash,
            salt,
          );
        }
      }

      // Validar role_id si se envía
      if (updateData.role_id !== undefined && updateData.role_id !== null) {
        if (!mongoose.Types.ObjectId.isValid(updateData.role_id)) {
          return res
            .status(400)
            .json({ success: false, message: "role_id debe ser un ID válido" });
        }
        const roleExists = await RoleModel.model.exists({
          _id: updateData.role_id,
        });
        if (!roleExists) {
          return res
            .status(400)
            .json({ success: false, message: "Rol inválido" });
        }
      }

      // Validar fallback_role_id si se envía
      if (
        updateData.fallback_role_id !== undefined &&
        updateData.fallback_role_id !== null
      ) {
        if (!mongoose.Types.ObjectId.isValid(updateData.fallback_role_id)) {
          return res
            .status(400)
            .json({
              success: false,
              message: "fallback_role_id debe ser un ID válido",
            });
        }
        const roleExists = await RoleModel.model.exists({
          _id: updateData.fallback_role_id,
        });
        if (!roleExists) {
          return res
            .status(400)
            .json({ success: false, message: "Rol de respaldo inválido" });
        }
      }

      // Normalizar booleanos
      ["is_active", "is_temporary_role"].forEach((field) => {
        if (updateData[field] !== undefined) {
          updateData[field] = Boolean(updateData[field]);
        }
      });

      // Lógica de rol temporal: calcular fecha de expiración si corresponde
      if (updateData.is_temporary_role === true) {
        const durationValue = updateData.role_duration_value;
        const durationUnit = updateData.role_duration_unit || "days";

        if (
          durationValue !== undefined &&
          typeof durationValue === "number" &&
          durationValue > 0
        ) {
          updateData.role_expiration_date = UserModel.calculateRoleExpiration(
            durationUnit,
            durationValue,
          );
        }
      }

      // Si se desactiva el rol temporal, limpiar campos relacionados
      if (updateData.is_temporary_role === false) {
        updateData.role_expiration_date = null;
        updateData.role_duration_value = null;
        updateData.role_duration_unit = null;
        updateData.fallback_role_id = null;
      }

      // Validar role_duration_value si se envía
      if (updateData.role_duration_value !== undefined) {
        if (
          typeof updateData.role_duration_value !== "number" ||
          updateData.role_duration_value <= 0
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message: "role_duration_value debe ser un número mayor a 0",
            });
        }
      }

      // Validar role_duration_unit si se envía
      if (updateData.role_duration_unit !== undefined) {
        const validUnits = ["seconds", "minutes", "hours", "days", "months"];
        if (!validUnits.includes(updateData.role_duration_unit)) {
          return res.status(400).json({
            success: false,
            message: `role_duration_unit debe ser uno de: ${validUnits.join(", ")}`,
          });
        }
      }

      // Validar last_login si se envía
      if (
        updateData.last_login !== undefined &&
        updateData.last_login !== null
      ) {
        const date = new Date(updateData.last_login);
        if (isNaN(date.getTime())) {
          return res
            .status(400)
            .json({
              success: false,
              message: "last_login debe ser una fecha válida",
            });
        }
        updateData.last_login = date;
      }

      // Usar el método patch del BaseModel
      const updatedUser = await UserModel.patch(id, updateData);

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      // Obtener usuario seguro (sin password_hash) con relaciones populadas
      const safeUser = await UserModel.model
        .findById(updatedUser._id)
        .populate("role_id fallback_role_id person_id")
        .select("-password_hash")
        .lean();

      return res.json({ success: true, data: safeUser });
    } catch (error) {
      console.error("Error en partialUpdate user:", error);

      // Manejo de errores de unicidad (username, email, code)
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const fieldName =
          field === "username"
            ? "nombre de usuario"
            : field === "email"
              ? "email"
              : "código";
        return res
          .status(409)
          .json({
            success: false,
            message: `Ya existe un usuario con ese ${fieldName}`,
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

      return res.status(400).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const payload = normalizePassword({ ...req.body });

      if (payload.email && !payload.person_id) {
        payload.person_id = await resolvePersonId(payload);

        if (!payload.person_id) {
          return res.status(400).json({
            success: false,
            message:
              "No se pudo resolver person_id desde el email proporcionado",
          });
        }
      }

      if (payload.role_id) {
        const roleExists = await RoleModel.model.exists({
          _id: payload.role_id,
        });
        if (!roleExists) {
          return res
            .status(400)
            .json({ success: false, message: "Rol inválido" });
        }
      }

      if (payload.person_id) {
        const personExists = await PersonModel.model.exists({
          _id: payload.person_id,
        });
        if (!personExists) {
          return res
            .status(400)
            .json({ success: false, message: "Persona inválida" });
        }
      }

      const user = await UserModel.update(req.params.id, payload);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      const safeUser = await UserModel.model
        .findById(user._id)
        .populate("role_id fallback_role_id person_id")
        .select("-password_hash")
        .lean();

      return res.json({ success: true, data: safeUser });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await UserModel.model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      return res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default UserController;
