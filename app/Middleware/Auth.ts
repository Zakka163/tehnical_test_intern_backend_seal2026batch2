import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthMiddleware {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      await auth.use('api').authenticate()
    } catch {
      return response.unauthorized({ message: 'Invalid or expired token' })
    }
    
    await next()
  }
}
