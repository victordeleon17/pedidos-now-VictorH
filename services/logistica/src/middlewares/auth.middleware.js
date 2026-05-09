const authMock = require('../data/auth.mock');

const attachDevUser = (req, res, next) => {
    const userId = Number(req.header('x-user-id')) || 1;
    const userMock = authMock.users.find((user) => user.id === userId) || authMock.users[0];
    const role = req.header('x-user-role') || userMock.role;

    req.user = {
        ...userMock,
        role,
        permissions: authMock.roles[role] || [],
        source: 'dev-simulado'
    };
    req.usuario = req.user;

    next();
};

const requireRole = (...roles) => (req, res, next) => {
    if (roles.length === 0 || roles.includes(req.user?.role)) return next();
    return res.status(403).json({ success: false, message: 'Rol no autorizado', required: roles, current: req.user?.role });
};

module.exports = {
    attachDevUser,
    requireRole
};
