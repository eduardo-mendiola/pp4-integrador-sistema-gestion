import { jest } from '@jest/globals';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockProduct = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  getUniqueBrands: jest.fn(),
  patch: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

jest.unstable_mockModule(
  path.resolve(__dirname, '../../src/models/ProductModel.js'),
  () => ({
    default: mockProduct
  })
);

// Mock de mongoose con la estructura correcta
const mockMongoose = {
  default: {
    Types: {
      ObjectId: {
        isValid: jest.fn()
      }
    }
  },
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
};

jest.unstable_mockModule('mongoose', () => mockMongoose);

const { default: ProductController } = await import(
  path.resolve(__dirname, '../../src/controllers/ProductController.js')
);

describe('ProductController - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      req.body = { name: 'Producto Test', price: 100, stock: 10 };
      const createdProduct = { id: '123', ...req.body };
      mockProduct.create.mockResolvedValue(createdProduct);

      await ProductController.create(req, res);

      expect(mockProduct.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdProduct
      });
    });

    it('should return 400 when creation fails', async () => {
      req.body = { name: 'Producto Test' };
      const error = new Error('Error de validación');
      mockProduct.create.mockRejectedValue(error);

      await ProductController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación'
      });
    });
  });

  describe('getAll', () => {
    it('should return all products with category and supplier', async () => {
      const mockProducts = [
        { id: '1', name: 'Producto 1' },
        { id: '2', name: 'Producto 2' }
      ];
      mockProduct.findAll.mockResolvedValue(mockProducts);

      await ProductController.getAll(req, res);

      expect(mockProduct.findAll).toHaveBeenCalledWith(['category', 'supplier']);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProducts
      });
    });

    it('should return 500 when getAll fails', async () => {
      const error = new Error('Error de base de datos');
      mockProduct.findAll.mockRejectedValue(error);

      await ProductController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de base de datos'
      });
    });
  });

  describe('getById', () => {
    it('should return a product by id', async () => {
      req.params.id = '123';
      const foundProduct = { id: '123', name: 'Producto Test' };
      mockProduct.findById.mockResolvedValue(foundProduct);

      await ProductController.getById(req, res);

      expect(mockProduct.findById).toHaveBeenCalledWith('123', ['category', 'supplier']);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: foundProduct
      });
    });

    it('should return 404 when product not found', async () => {
      req.params.id = '999';
      mockProduct.findById.mockResolvedValue(null);

      await ProductController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado'
      });
    });

    it('should return 500 when getById fails', async () => {
      req.params.id = '123';
      const error = new Error('Error de base de datos');
      mockProduct.findById.mockRejectedValue(error);

      await ProductController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de base de datos'
      });
    });
  });

  describe('getUniqueBrands', () => {
    it('should return unique brands', async () => {
      const mockBrands = ['Nike', 'Adidas', 'Puma'];
      mockProduct.getUniqueBrands.mockResolvedValue(mockBrands);

      await ProductController.getUniqueBrands(req, res);

      expect(mockProduct.getUniqueBrands).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockBrands
      });
    });

    it('should return 500 when getUniqueBrands fails', async () => {
      const error = new Error('Error al obtener marcas');
      mockProduct.getUniqueBrands.mockRejectedValue(error);

      await ProductController.getUniqueBrands(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener marcas'
      });
    });
  });

  describe('partialUpdate', () => {
    it('should update a product partially with valid data', async () => {
      req.params.id = '123';
      req.body = { name: 'Producto Actualizado', price: 150 };
      const updatedProduct = { id: '123', ...req.body };
      mockProduct.patch.mockResolvedValue(updatedProduct);
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);

      await ProductController.partialUpdate(req, res);

      expect(mockProduct.patch).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedProduct
      });
    });

    it('should return 400 when numeric field is negative', async () => {
      req.params.id = '123';
      req.body = { price: -10 };

      await ProductController.partialUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'price debe ser un número mayor o igual a 0'
      });
    });

    it('should return 400 when category is invalid ObjectId', async () => {
      req.params.id = '123';
      req.body = { category: 'invalid-id' };
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(false);

      await ProductController.partialUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'category debe ser un ID válido'
      });
    });

    it('should return 404 when product not found', async () => {
      req.params.id = '999';
      req.body = { name: 'Producto Actualizado' };
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);
      mockProduct.patch.mockResolvedValue(null);

      await ProductController.partialUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado'
      });
    });

    it('should return 400 when ValidationError occurs', async () => {
      req.params.id = '123';
      req.body = { name: 'Producto Actualizado' };
      mockMongoose.Types.ObjectId.isValid.mockReturnValue(true);
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = { name: { message: 'Name is required' } };
      mockProduct.patch.mockRejectedValue(error);

      await ProductController.partialUpdate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación',
        errors: ['Name is required']
      });
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      req.params.id = '123';
      req.body = { name: 'Producto Actualizado', price: 150 };
      const updatedProduct = { id: '123', ...req.body };
      mockProduct.update.mockResolvedValue(updatedProduct);

      await ProductController.update(req, res);

      expect(mockProduct.update).toHaveBeenCalledWith('123', req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedProduct
      });
    });

    it('should return 404 when product to update not found', async () => {
      req.params.id = '999';
      req.body = { name: 'Producto Actualizado' };
      mockProduct.update.mockResolvedValue(null);

      await ProductController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado'
      });
    });

    it('should return 400 when update fails', async () => {
      req.params.id = '123';
      req.body = { name: 'Producto Actualizado' };
      const error = new Error('Error de validación');
      mockProduct.update.mockRejectedValue(error);

      await ProductController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error de validación'
      });
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      req.params.id = '123';
      mockProduct.delete.mockResolvedValue({ id: '123' });

      await ProductController.remove(req, res);

      expect(mockProduct.delete).toHaveBeenCalledWith('123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Producto eliminado'
      });
    });

    it('should return 404 when product to delete not found', async () => {
      req.params.id = '999';
      mockProduct.delete.mockResolvedValue(null);

      await ProductController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Producto no encontrado'
      });
    });

    it('should return 500 when delete fails', async () => {
      req.params.id = '123';
      const error = new Error('Error al eliminar');
      mockProduct.delete.mockRejectedValue(error);

      await ProductController.remove(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al eliminar'
      });
    });
  });
});