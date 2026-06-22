import passport from '../config/passport.js'

export const loginAPI = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Credenciales inválidas'
      })
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr)
      }

      return res.json({
        success: true,
        message: 'Login exitoso',
        user
      })
    })
  })(req, res, next)
}

// Logout API
export const logoutAPI = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error)
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError)
      }

      res.clearCookie('connect.sid')
      return res.json({ success: true, message: 'Sesión cerrada' })
    })
  })
}

// Endpoint para obtener información del usuario autenticado
export const me = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticado' })
  }

  return res.json({ success: true, user: req.user })
}
