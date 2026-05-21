/**
 * Unit Tests - Date Helpers (Funciones Puras)
 * 
 * TDD Pattern: Arrange → Act → Assert
 * 
 * Tests para funciones puras de utilidad.
 * No requieren mocks ni dependencias externas.
 * Son extremadamente rápidos y fáciles de mantener.
 */

import { formatDate, formatDatesForInput } from '../../src/utils/dateHelpers.js';

describe('Unit Tests - Date Helpers', () => {
  
  describe('formatDate - Formatear fecha individual', () => {
    
    it('debe formatear fecha válida a YYYY-MM-DD', () => {
      // Arrange
      const date = new Date('2024-03-15T10:30:00.000Z');

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('2024-03-15');
    });

    it('debe manejar fechas en formato string', () => {
      // Arrange
      const dateString = '2024-12-25';

      // Act
      const result = formatDate(dateString);

      // Assert
      expect(result).toBe('2024-12-25');
    });

    it('debe retornar string vacío para fecha null', () => {
      // Arrange
      const date = null;

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('');
    });

    it('debe retornar string vacío para fecha undefined', () => {
      // Arrange
      const date = undefined;

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('');
    });

    it('debe formatear correctamente fechas de año nuevo', () => {
      // Arrange
      const date = new Date('2024-01-01T00:00:00.000Z');

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('2024-01-01');
    });

    it('debe formatear correctamente fin de año', () => {
      // Arrange
      const date = new Date('2024-12-31T23:59:59.999Z');

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('2024-12-31');
    });
  });

  describe('formatDatesForInput - Formatear múltiples fechas en objeto', () => {
    
    it('debe formatear campos de fecha especificados', () => {
      // Arrange
      const item = {
        name: 'Project A',
        start_date: new Date('2024-01-15'),
        end_date: new Date('2024-06-30'),
        budget: 50000
      };
      const fields = ['start_date', 'end_date'];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result.start_date).toBe('2024-01-15');
      expect(result.end_date).toBe('2024-06-30');
      expect(result.name).toBe('Project A');
      expect(result.budget).toBe(50000);
    });

    it('debe ignorar campos que no son fechas', () => {
      // Arrange
      const item = {
        name: 'Project A',
        status: 'active',
        start_date: new Date('2024-01-15')
      };
      const fields = ['start_date', 'status']; // status no es fecha

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result.start_date).toBe('2024-01-15');
      expect(result.status).toBe('active'); // No debería cambiar
    });

    it('debe manejar item null sin errores', () => {
      // Arrange
      const item = null;
      const fields = ['start_date'];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result).toBeNull();
    });

    it('debe manejar item undefined sin errores', () => {
      // Arrange
      const item = undefined;
      const fields = ['start_date'];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result).toBeUndefined();
    });

    it('debe manejar array de campos vacío', () => {
      // Arrange
      const item = {
        name: 'Project A',
        start_date: new Date('2024-01-15')
      };
      const fields = [];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result).toEqual(item);
    });

    it('debe crear nuevo objeto sin mutar el original', () => {
      // Arrange
      const item = {
        name: 'Project A',
        start_date: new Date('2024-01-15')
      };
      const fields = ['start_date'];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result).not.toBe(item); // Diferente referencia
      expect(item.start_date).toBeInstanceOf(Date); // Original no mutado
    });

    it('debe manejar campos inexistentes sin errores', () => {
      // Arrange
      const item = {
        name: 'Project A'
      };
      const fields = ['start_date', 'end_date']; // Campos que no existen

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result).toEqual(item);
    });

    it('debe formatear correctamente múltiples fechas', () => {
      // Arrange
      const item = {
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-15'),
        start_date: new Date('2024-02-01'),
        end_date: new Date('2024-12-31')
      };
      const fields = ['created_at', 'updated_at', 'start_date', 'end_date'];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result.created_at).toBe('2024-01-01');
      expect(result.updated_at).toBe('2024-01-15');
      expect(result.start_date).toBe('2024-02-01');
      expect(result.end_date).toBe('2024-12-31');
    });
  });

  describe('Edge cases y casos límite', () => {
    
    it('debe manejar fecha en timestamp Unix', () => {
      // Arrange
      const timestamp = 1704067200000; // 2024-01-01 en milisegundos
      const date = new Date(timestamp);

      // Act
      const result = formatDate(date);

      // Assert
      expect(result).toBe('2024-01-01');
    });

    it('debe manejar fechas muy antiguas', () => {
      // Arrange
      const oldDate = new Date('1900-01-01');

      // Act
      const result = formatDate(oldDate);

      // Assert
      expect(result).toBe('1900-01-01');
    });

    it('debe manejar fechas futuras', () => {
      // Arrange
      const futureDate = new Date('2100-12-31');

      // Act
      const result = formatDate(futureDate);

      // Assert
      expect(result).toBe('2100-12-31');
    });

    it('debe manejar objeto con fechas null en algunos campos', () => {
      // Arrange
      const item = {
        start_date: new Date('2024-01-15'),
        end_date: null,
        created_at: new Date('2024-01-01')
      };
      const fields = ['start_date', 'end_date', 'created_at'];

      // Act
      const result = formatDatesForInput(item, fields);

      // Assert
      expect(result.start_date).toBe('2024-01-15');
      expect(result.end_date).toBe('');
      expect(result.created_at).toBe('2024-01-01');
    });
  });
});
