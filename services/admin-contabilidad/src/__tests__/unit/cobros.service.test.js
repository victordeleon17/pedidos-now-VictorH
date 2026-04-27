const axios = require('axios');
const cobrosService = require('../../services/cobros.service');

jest.mock('axios');

describe('Cobros Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('obtenerCobros', () => {
    it('debe obtener cobros correctamente', async () => {
      const mockData = {
        data: [
          { id: 1, monto: 100, estado: 'completado' },
          { id: 2, monto: 200, estado: 'pendiente' }
        ]
      };

      axios.get.mockResolvedValue(mockData);

      const result = await cobrosService.obtenerCobros(
        '2026-04-01',
        '2026-04-27'
      );

      expect(result).toEqual(mockData.data);
      expect(axios.get).toHaveBeenCalled();
    });

    it('debe manejar errores de obtenerCobros', async () => {
      const error = new Error('Error de conexión');
      axios.get.mockRejectedValue(error);

      await expect(
        cobrosService.obtenerCobros('2026-04-01', '2026-04-27')
      ).rejects.toThrow('Error de conexión');
    });
  });

  describe('obtenerMultas', () => {
    it('debe obtener multas correctamente', async () => {
      const mockData = {
        data: [
          { id: 1, monto: 50, razon: 'cancelación tardía' }
        ]
      };

      axios.get.mockResolvedValue(mockData);

      const result = await cobrosService.obtenerMultas();

      expect(result).toEqual(mockData.data);
    });
  });
});