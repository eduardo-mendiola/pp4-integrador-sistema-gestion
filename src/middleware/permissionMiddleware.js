export const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role_id?.name

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      })
    }

    return next()
  }
}
