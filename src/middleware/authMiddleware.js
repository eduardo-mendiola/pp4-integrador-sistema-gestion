// Middleware to check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next()
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  })
}
