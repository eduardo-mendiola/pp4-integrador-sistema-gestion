import mongoose from 'mongoose';

class BaseModel {
    constructor(schema, collectionName) {
        // Evitar sobrescribir modelos si ya existen
        this.model = mongoose.models[collectionName] || mongoose.model(collectionName, schema);
    }

    // Crear un nuevo documento
    async create(data) {
        return this.model.create(data);
    }

    // Obtener todos los documentos
    async findAll(populateFields = []) {
        let query = this.model.find({});
        populateFields.forEach(field => {
            query = query.populate(field);
        });
        return query;
    }

    // Buscar por id
    async findById(id, populateFields = []) {
        let query = this.model.findById(id);
        populateFields.forEach(field => {
            query = query.populate(field);
        });
        return query;
    }

    // Actualizar documento completo
    async update(id, updateData) {
        return this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    // Actualizar parcialmente (patch)
    async patch(id, updateData) {
        return this.model.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    }

    // Eliminar documento
    async delete(id) {
        const deleted = await this.model.findByIdAndDelete(id);
        return !!deleted;
    }
}

export default BaseModel;
