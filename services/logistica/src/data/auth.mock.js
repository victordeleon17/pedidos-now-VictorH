module.exports = {
    users: [
        { id: 1, nombre: 'Admin Logistica', role: 'admin', email: 'admin.logistica@test.local' },
        { id: 101, nombre: 'Repartidor Demo 101', role: 'repartidor', email: 'repartidor101@test.local' },
        { id: 102, nombre: 'Repartidor Demo 102', role: 'repartidor', email: 'repartidor102@test.local' },
        { id: 201, nombre: 'Restaurante Demo', role: 'restaurante', email: 'restaurante@test.local' },
        { id: 301, nombre: 'Cliente Demo', role: 'cliente', email: 'cliente@test.local' }
    ],
    roles: {
        admin: ['*'],
        repartidor: ['feed:read', 'entregas:accept', 'entregas:update-own', 'ubicacion:update'],
        restaurante: ['entregas:create-restaurante', 'entregas:read-own'],
        cliente: ['entregas:read-own']
    }
};
