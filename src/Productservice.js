class ProductService {
  constructor(productRepository) {
    this.repo = productRepository; // dependencia inyectada
  }
 
  async getById(id) {
    const product = await this.repo.findById(id);
    if (!product) throw new Error(`Producto ${id} no encontrado.`);
    return product;
  }
 
  async getByCategory(category) {
    const all = await this.repo.findAll();
    return all.filter(p => p.category === category);
  }
 
  async searchByName(query) {
    if (!query || query.trim() === '') {
      throw new Error('El query de búsqueda no puede estar vacío.');
    }
    const all = await this.repo.findAll();
    return all.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }
 
  async create(productData) {
    if (!productData.name) {
      throw new Error('El nombre del producto es requerido.');
    }
    if (productData.price === undefined || productData.price === null) {
      throw new Error('El precio del producto es requerido.');
    }
    if (productData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0.');
    }
    return await this.repo.save(productData);
  }
}
 
module.exports = ProductService;
 