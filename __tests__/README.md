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
│   └── testHelpers.js       # Funciones como connectDB, clearDatabase, etc.
│
├── builders/                 # Patrón Builder para datos de prueba
│   └── dataBuilders.js      # ProjectBuilder, ClientBuilder, etc.
│
├── fixtures/                 # Datos estáticos de prueba
│   └── testData.js          # VALID_PROJECT, FIXTURE_IDS, ERROR_MESSAGES
│
├── integration/              # Tests de integración (endpoints completos)
│   ├── projects.test.js     # POST /api/projects
│   ├── projects-crud.test.js # GET, PUT, DELETE /api/projects
│   ├── clients.test.js      # (agregar según necesidad)
│   └── ...
│
└── unit/                     # Tests unitarios (lógica aislada)
    ├── projectController.test.js  # Tests con mocks
    ├── dateHelpers.test.js        # Tests de funciones puras
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
  - Configura timeouts
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

Funciones disponibles:
- `connectDB()` - Conecta a MongoDB Memory Server
- `clearDatabase()` - Limpia todas las colecciones
- `disconnectDB()` - Cierra conexión
- `createTestUser()` - Crea usuario de prueba
- `generateObjectId()` - Genera ObjectId válido
- `expectApiError()` - Valida estructura de error

### `builders/`

Patrón Builder para crear datos de prueba de forma fluida:

```javascript
import { ProjectBuilder } from '../builders/dataBuilders.js';

const project = new ProjectBuilder()
  .withName('Mi Proyecto')
  .withBudget(50000)
  .inProgress()
  .build();

// Para testing de validaciones
const invalidProject = new ProjectBuilder()
  .buildWithout('name'); // Crea proyecto sin nombre
```

**Builders disponibles:**
- `ProjectBuilder`
- `ClientBuilder`
- `EmployeeBuilder`
- `TaskBuilder`

### `fixtures/`

Datos estáticos y consistentes:

```javascript
import { VALID_PROJECT, FIXTURE_IDS, ERROR_MESSAGES } from '../fixtures/testData.js';

// Usar datos de fixture
const response = await request(app)
  .post('/api/projects')
  .send(VALID_PROJECT);

// IDs consistentes para debugging
const project = await Project.findById(FIXTURE_IDS.project1);

// Mensajes de error esperados
expect(error).toContain(ERROR_MESSAGES.REQUIRED_FIELD('name'));
```

### `integration/`

Tests que verifican el comportamiento completo del sistema:

**Características:**
- Usan base de datos real (Memory Server)
- Prueban endpoints HTTP completos
- Verifican interacción entre capas (routes → controllers → models)
- Más lentos pero más confiables

**Ejemplo:**
```javascript
// projects.test.js
describe('POST /api/projects', () => {
  it('debe crear proyecto con datos válidos', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send(validData)
      .expect(201);
    
    expect(response.body).toHaveProperty('_id');
  });
});
```

### `unit/`

Tests que verifican componentes aislados:

**Características:**
- No usan base de datos
- Usan mocks para dependencias
- Muy rápidos
- Ideales para lógica de negocio

**Ejemplo con mocks:**
```javascript
// projectController.test.js
jest.mock('../../src/models/ProjectModel.js');

it('debe retornar todos los proyectos', async () => {
  Project.findAll = jest.fn().mockResolvedValue(mockData);
  
  await ProjectController.getAll(req, res);
  
  expect(Project.findAll).toHaveBeenCalled();
});
```

**Ejemplo de función pura:**
```javascript
// dateHelpers.test.js
it('debe formatear fecha correctamente', () => {
  const result = formatDate(new Date('2024-01-15'));
  expect(result).toBe('2024-01-15');
});
```

## Convenciones de Nombres

### Archivos de Test

- **Integration**: `[entidad].test.js` (ej: `projects.test.js`)
- **Unit**: `[componente].test.js` (ej: `projectController.test.js`)

### Suites de Tests (describe)

```javascript
// Nivel superior: Tipo + Entidad
describe('Integration Tests - Projects API', () => {
  
  // Nivel 2: Endpoint o método específico
  describe('POST /api/projects', () => {
    
    // Nivel 3: Escenario específico
    describe('Validación de campos requeridos', () => {
      
      // Test individual
      it('debe retornar 400 cuando falta el nombre', () => {});
    });
  });
});
```

### Tests Individuales (it)

Usar descripciones en español, claras y específicas:

**Bueno:**
```javascript
it('debe crear proyecto con datos válidos')
it('debe retornar 400 cuando falta el nombre del proyecto')
it('debe actualizar solo el presupuesto sin afectar otros campos')
```

**Malo:**
```javascript
it('works')
it('test project')
it('should do something')
```

## Flujo de Trabajo Típico

### 1. Agregar Test de Integración

```javascript
// __tests__/integration/projects.test.js

import request from 'supertest';
import app from '../../src/app.js';
import { connectDB, clearDatabase, disconnectDB } from '../helpers/testHelpers.js';

describe('Integration Tests - Projects', () => {
  beforeAll(async () => await connectDB());
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await disconnectDB());

  it('debe crear proyecto', async () => {
    // Test implementation
  });
});
```

### 2. Agregar Test Unitario

```javascript
// __tests__/unit/projectService.test.js

import { calculateProjectDuration } from '../../src/services/projectService.js';

describe('Unit Tests - Project Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe calcular duración correctamente', () => {
    // Test implementation
  });
});
```

### 3. Usar Builders

```javascript
// En el test
import { ProjectBuilder } from '../builders/dataBuilders.js';

const validProject = new ProjectBuilder()
  .withName('Test')
  .build();
```

### 4. Usar Fixtures

```javascript
// En el test
import { VALID_PROJECT } from '../fixtures/testData.js';

const response = await request(app)
  .post('/api/projects')
  .send(VALID_PROJECT);
```

## Comandos Útiles

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo integration tests
npm test -- __tests__/integration

# Ejecutar solo unit tests
npm test -- __tests__/unit

# Ejecutar test específico
npm test projects.test.js

# Modo watch (desarrollo)
npm run test:watch

# Con cobertura
npm run test:coverage
```

## Agregar Nuevas Entidades

Para agregar tests de una nueva entidad (ej: `tasks`):

1. **Crear Builder:**
```javascript
// __tests__/builders/dataBuilders.js
export class TaskBuilder {
  constructor() {
    this.task = { /* defaults */ };
  }
  // métodos builder
  build() { return { ...this.task }; }
}
```

2. **Agregar Fixtures:**
```javascript
// __tests__/fixtures/testData.js
export const VALID_TASK = { /* data */ };
export const FIXTURE_IDS = {
  ...existing,
  task1: new mongoose.Types.ObjectId('...')
};
```

3. **Crear Integration Tests:**
```javascript
// __tests__/integration/tasks.test.js
describe('Integration Tests - Tasks API', () => {
  // tests
});
```

4. **Crear Unit Tests (opcional):**
```javascript
// __tests__/unit/taskController.test.js
describe('Unit Tests - TaskController', () => {
  // tests con mocks
});
```

## Mejores Prácticas

1. Mantener tests independientes entre sí
2. Limpiar base de datos en `beforeEach`
3. Usar builders para datos complejos
4. Usar fixtures para datos consistentes
5. Un concepto por test
6. Nombres descriptivos
7. Priorizar integration tests sobre unit tests
8. Ejecutar tests antes de cada commit

---

**Para más información consulta [TESTING_GUIDE.md](../notes/TESTING_GUIDE.md)**
