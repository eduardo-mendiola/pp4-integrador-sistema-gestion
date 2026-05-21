export function filterManagers(employees) {
    if (!Array.isArray(employees)) return [];

    const managerRoles = ['Gerente de Proyecto', 'Administrador', 'CEO'];

    // Filtramos empleados cuyo user_id exista y tenga rol válido
    return employees.filter(emp =>
        emp.is_active &&                     // solo empleados activos
        emp.user_id &&                       // que tengan usuario asignado
        emp.user_id.role_id &&               // que el usuario tenga rol
        managerRoles.includes(emp.user_id.role_id.name) // rol permitido
    );
}



