# Estructura de Testing

## Organización de Archivos

```
__tests__/
├── setup/                    # Configuración global de tests
│   ├── globalSetup.js       # Inicializa MongoDB Memory Server (beforeAll global)
│   ├── globalTeardown.js    # Detiene MongoDB Memory Server (afterAll global)
│   └── setupTests.js        # Configuración por archivo (timeouts, helpers)
│
├── helpers/                  # Utilidades compartidas
│   ├── testHelpers.js       # Funciones como connectDB, clearDatabase, etc.
│   └── authHelper.js        # Bypass de autenticación para tests
│
├── builders/                 # Patrón Builder para datos de prueba
│   └── dataBuilders.js      # PersonBuilder, EmployeeBuilder, SaleBuilder, etc.
│
├── fixtures/                 # Datos estáticos de prueba
│   └── testData.js          # VALID_PRODUCT, FIXTURE_IDS, ERROR_MESSAGES
│
├── integration/              # Tests de integración (endpoints completos)
│   ├── products.test.js     # POST /api/products
│   ├── products-crud.test.js # GET, PUT, DELETE /api/products
│   ├── employees-crud.test.js # CRUD completo de empleados con estados
│   ├── persons-crud.test.js # CRUD completo de personas
│   ├── sales-crud.test.js   # CRUD completo de ventas
│   └── ...
│
└── unit/                     # Tests unitarios (lógica aislada)
    ├── dateHelpers.test.js        # Tests de funciones puras de fecha
    ├── permissionHelpers.test.js  # Tests de verificación de permisos
    └── ...

```

## Descripción de Cada Carpeta

### `setup/`

Archivos de configuración que se ejecutan automáticamente:

- **globalSetup.js**: Se ejecuta UNA VEZ antes de todos los tests
  - Inicia MongoDB Memory Server
  - Configura variables de entorno de test
  
- **globalTeardown.js**: Se ejecuta UNA VEZ después de todos los tests
  - Detiene MongoDB Memory Server
  - Limpieza final

- **setupTests.js**: Se ejecuta antes de CADA archivo de test
  - Configura `NODE_ENV = 'test'` para activar bypass de autenticación
  - Define helpers globales
  - Limpia mocks

### `helpers/`

Funciones reutilizables para tests:

```javascript
// Ejemplo de uso
import { connectDB, clearDatabase, disconnectDB } from '../helpers/testHelpers.js';

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await clearDatabase(); // Mantiene tests aislados
});
```

Funciones disponibles en `testHelpers.js`:
- `connectDB()` - Conecta a MongoDB Memory Server
- `clearDatabase()` - Limpia todas las colecciones
- `disconnectDB()` - Cierra conexión
- `createTestUser()` - Crea usuario de prueba
- `generateObjectId()` - Genera ObjectId válido
- `expectApiError()` - Valida estructura de error

Funciones disponibles en `authHelper.js`:
- `createMockUser()` - Crea usuario mock con permisos completos
- `bypassAuth()` - Middleware que bypasea autenticación en modo test
- `setupAuthForTests()` - Configuración base para requests en tests

### `builders/`

Patrón Builder para crear datos de prueba de forma fluida:

```javascript
import { PersonBuilder, EmployeeBuilder } from '../builders/dataBuilders.js';

// Crear persona
const person = new PersonBuilder()
  .withName('Juan')
  .withLastName('Pérez')
  .withEmail('juan@test.com')
  .withDni('12345678')
  .build();

// Crear empleado con estados
const employee = new EmployeeBuilder()
  .withPersonId(person._id)
  .withShiftSchedule('full_time')
  .inactive('license', 'Licencia por 30 días')
  .contractTerminated(new Date(), 'resignation', 'Renuncia voluntaria')
  .build();
```

**Builders disponibles:**
- `PersonBuilder` - Personas con DNI, nombre, dirección, etc.
- `EmployeeBuilder` - Empleados con estados (status, contract_status)
- `SaleBuilder` - Ventas con items, pagos, cálculos automáticos
- `ProductBuilder` - Productos con SKU, precio, stock
- `ClientBuilder` - Clientes con documento, tipo, dirección
- `UserBuilder` - Usuarios con roles, permisos, credenciales
- `PaymentMethodBuilder` - Métodos de pago
- `CategoryBuilder` - Categorías
- `SupplierBuilder` - Proveedores

### `fixtures/`

Datos estáticos y consistentes:

```javascript
import { VALID_PRODUCT, FIXTURE_IDS, ERROR_MESSAGES } from '../fixtures/testData.js';

// Usar datos de fixture
const response = await request(app)
  .post('/api/products')
  .send(VALID_PRODUCT);

// IDs consistentes para debugging
const product = await Product.findById(FIXTURE_IDS.product1);

// Mensajes de error esperados
expect(error).toContain(ERROR_MESSAGES.REQUIRED_FIELD('name'));
```

### `integration/`

Tests que verifican el comportamiento completo del sistema:

**Características:**
- Usan base de datos real (MongoDB Memory Server)
- Prueban endpoints HTTP completos
- Verifican interacción entre capas (routes → controllers → models)
- Bypass automático de autenticación cuando `NODE_ENV = 'test'`
- Más lentos pero más confiables

**Tests de integración disponibles:**

1. **`employees-crud.test.js`** - CRUD completo de empleados
   - Registro completo (persona + usuario + empleado)
   - Actualización de estados (status, contract_status)
   - Lógica automática: contrato terminado → empleado inactivo
   - Validaciones de campos obligatorios

2. **`persons-crud.test.js`** - CRUD completo de personas
   - Creación con/sin dirección
   - Actualización parcial
   - Validación de DNI único
   - Eliminación

3. **`sales-crud.test.js`** - CRUD completo de ventas
   - Creación con múltiples items
   - Cálculos automáticos (subtotal, impuestos, total)
   - Validación de productos existentes
   - Cancelación de ventas con reintegro de stock

4. **`products-crud.test.js`** - CRUD completo de productos
   - Creación con categoría y proveedor
   - Actualización de precio y stock
   - Eliminación

**Ejemplo:**
```javascript
// employees-crud.test.js
describe('PATCH /api/employees/:id - Actualización de estados', () => {
  it('debe cambiar contrato a terminado y setear empleado como inactivo automáticamente', async () => {
    const updateData = {
      contract_status: 'terminated',
      termination_date: '2024-12-31',
      termination_reason: 'resignation'
    };

    const response = await request(app)
      .patch(`/api/employees/${testEmployee._id}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.contract_status).toBe('terminated');
    expect(response.body.data.status).toBe('inactive');
    expect(response.body.data.status_reason).toBe('contract_end');
  });
});
```

### `unit/`

Tests que verifican componentes aislados:

**Características:**
- No usan base de datos
- Muy rápidos
- Ideales para lógica de negocio y funciones puras

**Tests unitarios disponibles:**

1. **`dateHelpers.test.js`** - Funciones de formateo de fechas
   - `formatDate()` - Formatear fecha individual
   - `formatDatesForInput()` - Formatear múltiples fechas
   - Edge cases (null, undefined, timestamps)

2. **`permissionHelpers.test.js`** - Verificación de permisos
   - `hasPermission()` - Verificar permiso individual
   - `hasAllPermissions()` - Verificar múltiples permisos
   - `hasAnyPermission()` - Verificar al menos un permiso
   - `isAdmin()` - Verificar administrador
   - `getValidPermissions()` - Filtrar permisos válidos
   - `sanitizePermissions()` - Sanitizar array de permisos

**Ejemplo de función pura:**
```javascript
// permissionHelpers.test.js
describe('hasPermission - Verificar permiso individual', () => {
  it('debe retornar true si el usuario tiene el permiso', () => {
    const user = createUserWithPermissions(['view_products', 'edit_products']);
    const result = hasPermission(user, 'view_products');
    expect(result).toBe(true);
  });

  it('debe retornar false si el permiso no existe en el sistema', () => {
    const user = createUserWithPermissions(['view_products']);
    const result = hasPermission(user, 'invalid_permission');
    expect(result).toBe(false);
  });
});
```

## Configuración de Autenticación en Tests

El sistema usa un bypass automático de autenticación cuando `NODE_ENV = 'test'`:

1. **`setupTests.js`** establece `process.env.NODE_ENV = 'test'`
2. **`app.js`** detecta el entorno y aplica el middleware `bypassAuth`
3. **`bypassAuth`** inyecta un usuario mock con permisos completos

Esto permite que los tests de integración accedan a endpoints protegidos sin necesidad de login real.

## Convenciones de Nombres

### Archivos de Test

- **Integration**: `[entidad]-crud.test.js` (ej: `employees-crud.test.js`)
- **Unit**: `[componente].test.js` (ej: `permissionHelpers.test.js`)

### Suites de Tests (describe)

```javascript
// Nivel superior: Tipo + Entidad
describe('Integration Tests - Employees API', () => {
  
  // Nivel 2: Endpoint o método específico
  describe('PATCH /api/employees/:id - Actualización de estados', () => {
    
    // Nivel 3: Escenario específico
    describe('Lógica automática de estados', () => {
      
      // Test individual
      it('debe cambiar contrato a terminado y setear empleado como inactivo automáticamente', () => {});
    });
  });
});
```

### Tests Individuales (it)

Usar descripciones en español, claras y específicas:

**Bueno:**
```javascript
it('debe crear persona con datos válidos')
it('debe retornar 400 cuando falta el DNI')
it('debe cambiar contrato a terminado y setear empleado como inactivo automáticamente')
it('debe retornar true si el usuario tiene todos los permisos del sistema')
```

**Malo:**
```javascript
it('works')
it('test employee')
it('should do something')
```

## Flujo de Trabajo Típico

### 1. Agregar Test de Integración

```javascript
// __tests__/integration/employees-crud.test.js

import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, clearDatabase, disconnectDB } from '../helpers/testHelpers.js';

describe('Integration Tests - Employees API', () => {
  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  it('debe crear empleado con estados', async () => {
    // Test implementation
  });
});
```

### 2. Agregar Test Unitario

```javascript
// __tests__/unit/permissionHelpers.test.js

import { hasPermission } from '../../src/utils/permissionHelpers.js';

describe('Unit Tests - Permission Helpers', () => {
  it('debe retornar true si el usuario tiene el permiso', () => {
    const user = createUserWithPermissions(['view_products']);
    const result = hasPermission(user, 'view_products');
    expect(result).toBe(true);
  });
});
```

### 3. Usar Builders

```javascript
// En el test
import { EmployeeBuilder } from '../builders/dataBuilders.js';

const employee = new EmployeeBuilder()
  .withPersonId(personId)
  .withShiftSchedule('full_time')
  .inactive('license', 'Licencia médica')
  .build();
```

### 4. Usar Fixtures

```javascript
// En el test
import { VALID_PRODUCT } from '../fixtures/testData.js';

const response = await request(app)
  .post('/api/products')
  .send(VALID_PRODUCT);
```

## Comandos Útiles

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar solo integration tests
pnpm test __tests__/integration

# Ejecutar solo unit tests
pnpm test __tests__/unit

# Ejecutar test específico
pnpm test __tests__/integration/employees-crud.test.js

# Modo watch (desarrollo)
pnpm run test:watch

# Con cobertura
pnpm run test:coverage
```

## Agregar Nuevas Entidades

Para agregar tests de una nueva entidad (ej: `promotions`):

1. **Crear Builder:**
```javascript
// __tests__/builders/dataBuilders.js
export class PromotionBuilder {
  constructor() {
    this.promotion = { /* defaults */ };
  }
  withName(name) {
    this.promotion.name = name;
    return this;
  }
  build() { return { ...this.promotion }; }
}
```

2. **Agregar Fixtures (opcional):**
```javascript
// __tests__/fixtures/testData.js
export const VALID_PROMOTION = { /* data */ };
```

3. **Crear Integration Tests:**
```javascript
// __tests__/integration/promotions-crud.test.js
describe('Integration Tests - Promotions API', () => {
  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  it('debe crear promoción', async () => {
    // tests
  });
});
```

4. **Crear Unit Tests (opcional):**
```javascript
// __tests__/unit/promotionHelpers.test.js
describe('Unit Tests - Promotion Helpers', () => {
  it('debe calcular descuento correctamente', () => {
    // tests
  });
});
```

## Mejores Prácticas

1. Mantener tests independientes entre sí
2. Limpiar base de datos en `beforeEach`
3. Usar builders para datos complejos
4. Usar fixtures para datos consistentes
5. Un concepto por test
6. Nombres descriptivos en español
7. Priorizar integration tests sobre unit tests
8. Ejecutar tests antes de cada commit
9. Prefijar datos de test con `TEST_` para evitar conflictos
10. Usar `productId` en lugar de `product` al crear ventas (convención del backend)

## Resumen de Tests Implementados

### Tests Unitarios (49 tests)
- `dateHelpers.test.js` - 18 tests
- `permissionHelpers.test.js` - 31 tests

### Tests de Integración (43 tests)
- `employees-crud.test.js` - 12 tests (incluye lógica de estados)
- `persons-crud.test.js` - 10 tests
- `sales-crud.test.js` - 9 tests
- `products-crud.test.js` - 12 tests

**Total: 92 tests pasando correctamente** 
```

Listo, actualicé el README con todos los cambios que hicimos. ¿Hacemos commit?