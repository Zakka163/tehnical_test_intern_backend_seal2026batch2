import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Role {
  public async handle(
    { auth, response }: HttpContextContract,
    next: () => Promise<void>,
    allowedRoles: string[]
  ) {
    const user = auth.use('api').user

    // Ensure user is authenticated
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized access' })
    }

    // Check if user's role is in the allowedRoles array
    if (!allowedRoles.includes(user.role)) {
      return response.forbidden({
        message: `Forbidden: Only ${allowedRoles.join(' or ')} can access this resource`,
      })
    }

    await next()
  }
}
