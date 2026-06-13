import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthController {
  /**
   * Conventional Login - Login with email & password
   */
  public async login({ request, auth, response }: HttpContextContract) {
    const loginSchema = schema.create({
      email: schema.string({}, [rules.email()]),
      password: schema.string({}, [rules.minLength(6)]),
    })

    const data = await request.validate({ schema: loginSchema })

    try {
      const token = await auth.use('api').attempt(data.email, data.password, {
        expiresIn: '7days',
      })

      const user = auth.use('api').user!

      return response.ok({
        message: 'Login successful',
        token: token.token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          leaveLimit: user.leaveLimit,
        },
      })
    } catch {
      return response.unauthorized({
        message: 'Invalid email or password',
      })
    }
  }

  /**
   * Logout - Revoke current token
   */
  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()

    return response.ok({
      message: 'Logout successful',
    })
  }

  // ─── OAuth Google ────────────────────────────────────────────────────────────

  /**
   * Redirect to Google OAuth page
   */
  public async googleRedirect({ ally }: HttpContextContract) {
    return ally.use('google').redirect()
  }

  /**
   * Handle Google OAuth callback
   */
  public async googleCallback({ ally, auth, response }: HttpContextContract) {
    const google = ally.use('google') as import('@ioc:Adonis/Addons/Ally').GoogleDriverContract

    if (google.accessDenied()) {
      return response.badRequest({ message: 'Access denied by user' })
    }

    if (google.stateMisMatch()) {
      return response.badRequest({ message: 'State mismatch, possible CSRF attack' })
    }

    if (google.hasError()) {
      return response.badRequest({ message: google.getError() })
    }

    const googleUser = await google.user()

    // Find or create user by Google email
    const user = await User.firstOrCreate(
      { email: googleUser.email! },
      {
        name: googleUser.name,
        email: googleUser.email!,
        provider: 'google',
        providerId: googleUser.id,
        status: 'active',
        leaveLimit: 12,
        role: 'employee',
      }
    )

    const token = await auth.use('api').generate(user, {
      expiresIn: '7days',
    })

    return response.ok({
      message: 'Google login successful',
      token: token.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        leaveLimit: user.leaveLimit,
      },
    })
  }
}
