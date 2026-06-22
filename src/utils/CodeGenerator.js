class CodeGenerator {
    constructor(collection) {
        this.collection = collection; // colección de MongoDB para verificar códigos únicos
    }

    // Método para generar código basado en un ObjectId existente
    generateCodeFromId(objectId, prefix = "") {
        const hexString = objectId.toString();
        const shortId = hexString.slice(-5); // últimos 5 caracteres
        return prefix ? `${prefix}${shortId}` : shortId;
    }
}

export default CodeGenerator;