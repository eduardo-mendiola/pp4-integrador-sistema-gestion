export function filterManagers(employees) {
    if (!Array.isArray(employees)) return [];

    const managerRoles = ['Gerente de Proyecto', 'Administrador', 'CEO'];

    return employees.filter(employee =>
        employee.is_active &&                     // solo activos
        employee.role_id &&
        managerRoles.includes(employee.role_id.name)
    );
}
