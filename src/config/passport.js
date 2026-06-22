import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import UserModel from '../models/UserModel.js'

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await UserModel.model.findOne({
        $or: [{ email }, { username: email }]
      }).populate('role_id person_id')

      if (!user) {
        return done(null, false, { message: 'Usuario o contraseña incorrectos' })
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return done(null, false, { message: 'Usuario o contraseña incorrectos' })
      }

      if (!user.is_active) {
        return done(null, false, { message: 'Tu cuenta está inactiva. Contacta al administrador.' })
      }

      await UserModel.updateLastLogin(user._id)
      return done(null, user)
    } catch (error) {
      return done(error)
    }
  }
))

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.model.findById(id)
      .populate('role_id person_id')
      .select('-password_hash')

    if (!user) {
      return done(null, false)
    }

    done(null, user)
  } catch (error) {
    done(error)
  }
})

export default passport