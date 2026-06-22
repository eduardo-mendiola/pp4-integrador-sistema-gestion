// Middleware para validar la entrada de datos en clientes y empleados
const validateClientInput = (req, res, next) => {
    const { name, contact_name, email } = req.body;
    if (!name || !contact_name || !email) {
        return res.status(400).json({ message: 'Nombre de la empresa, el nombre del contacto y el email son campos obligatorios.' });
    }
    
    next(); 
};

// Validación para usuarios
const validateEmployeeInput = (req, res, next) => {
    const { first_name, last_name, area_id } = req.body;

    if (!first_name || !last_name || !area_id) {
        return res.status(400).json({ 
            message: 'first_name, last_name y area_id son campos obligatorios.'
        });
    }

    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato de email inválido.' });
    }

    next();
};

export {
    validateClientInput,
    validateEmployeeInput,
};

