import Product from '../models/ProductModel.js';

const ProductController = {
  create: async (req, res) => {
    try {
      const product = await Product.create(req.body);
      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      console.error('Error creating product:', error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, data: products });
    } catch (error) {
      console.error('Error fetching products:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id).lean();
      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      return res.json({ success: true, data: product });
    } catch (error) {
      console.error('Error fetching product:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      }).lean();

      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      return res.json({ success: true, data: product });
    } catch (error) {
      console.error('Error updating product:', error.message);
      return res.status(400).json({ success: false, message: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const deleted = await Product.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      return res.json({ success: true, message: 'Producto eliminado' });
    } catch (error) {
      console.error('Error deleting product:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default ProductController;
