const ProductService = require('../src/productService');

// Repositorio simulado con funciones mockeadas
const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
};

describe('ProductService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks(); // limpia historial de llamadas entre tests
    service = new ProductService(mockRepo);
  });

  // ─────────────────────────────────────────────
  // getById()
  // ─────────────────────────────────────────────
  describe('getById()', () => {
    it('devuelve el producto cuando existe', async () => {
      // Arrange
      const fakeProduct = { id: 1, name: 'Teclado', price: 80000, category: 'perifericos' };
      mockRepo.findById.mockResolvedValue(fakeProduct);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result).toEqual(fakeProduct);
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
    });

    it('lanza Error si el producto no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getById(99)).rejects.toThrow('Producto 99 no encontrado.');
    });

    it('llama al repositorio con el ID correcto', async () => {
      mockRepo.findById.mockResolvedValue({ id: 5, name: 'Mouse', price: 30000 });

      await service.getById(5);

      expect(mockRepo.findById).toHaveBeenCalledWith(5);
    });
  });

  // ─────────────────────────────────────────────
  // getByCategory()
  // ─────────────────────────────────────────────
  describe('getByCategory()', () => {
    const products = [
      { id: 1, name: 'Teclado',   price: 80000, category: 'perifericos' },
      { id: 2, name: 'Monitor',   price: 900000, category: 'pantallas'  },
      { id: 3, name: 'Mouse',     price: 30000,  category: 'perifericos' },
      { id: 4, name: 'Audífonos', price: 150000, category: 'audio'      },
    ];

    beforeEach(() => {
      mockRepo.findAll.mockResolvedValue(products);
    });

    it('devuelve solo los productos de la categoría solicitada', async () => {
      const result = await service.getByCategory('perifericos');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'perifericos')).toBe(true);
    });

    it('devuelve array vacío si la categoría no tiene productos', async () => {
      const result = await service.getByCategory('laptops');

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // searchByName()
  // ─────────────────────────────────────────────
  describe('searchByName()', () => {
    const products = [
      { id: 1, name: 'Teclado Mecánico', price: 250000, category: 'perifericos' },
      { id: 2, name: 'Teclado Membrana', price: 60000,  category: 'perifericos' },
      { id: 3, name: 'Mouse Gamer',      price: 90000,  category: 'perifericos' },
    ];

    beforeEach(() => {
      mockRepo.findAll.mockResolvedValue(products);
    });

    it('devuelve los productos que contienen el query en el nombre', async () => {
      const result = await service.searchByName('Teclado');

      expect(result).toHaveLength(2);
      expect(result.every(p => p.name.includes('Teclado'))).toBe(true);
    });

    it('la búsqueda es case-insensitive', async () => {
      const result = await service.searchByName('teclado');

      expect(result).toHaveLength(2);
    });

    it('lanza Error si el query está vacío', async () => {
      await expect(service.searchByName('')).rejects.toThrow(Error);
    });

    it('lanza Error si el query es solo espacios', async () => {
      await expect(service.searchByName('   ')).rejects.toThrow(Error);
    });
  });

  // ─────────────────────────────────────────────
  // create()
  // ─────────────────────────────────────────────
  describe('create()', () => {
    it('guarda y devuelve el producto cuando los datos son válidos', async () => {
      const newProduct = { name: 'Webcam HD', price: 120000, category: 'perifericos' };
      const savedProduct = { id: 10, ...newProduct };
      mockRepo.save.mockResolvedValue(savedProduct);

      const result = await service.create(newProduct);

      expect(result).toEqual(savedProduct);
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockRepo.save).toHaveBeenCalledWith(newProduct);
    });

    it('lanza Error si el nombre está ausente', async () => {
      await expect(service.create({ price: 50000 })).rejects.toThrow(Error);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('lanza Error si el precio es negativo', async () => {
      await expect(service.create({ name: 'Producto', price: -100 })).rejects.toThrow(Error);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('lanza Error si el precio es cero', async () => {
      await expect(service.create({ name: 'Producto', price: 0 })).rejects.toThrow(Error);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('save() solo se llama una vez con datos válidos', async () => {
      mockRepo.save.mockResolvedValue({ id: 1, name: 'Silla', price: 500000 });

      await service.create({ name: 'Silla', price: 500000 });

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});