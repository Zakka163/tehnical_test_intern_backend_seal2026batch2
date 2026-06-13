import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const hashedPassword = await Hash.make('password123')

    await User.updateOrCreateMany('email', [
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        leaveLimit: 12,
      },
      {
        name: 'Employee Test',
        email: 'employee@example.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        leaveLimit: 12,
      },
    ])

    console.log('✅ Seeder done: 2 users created (admin & employee)')
  }
}
