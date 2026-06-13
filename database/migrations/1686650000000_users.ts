import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'
  protected schemaName = 'sistem_cuti'

  public async up () {
    // Buat schema jika belum ada
    await this.raw(`CREATE SCHEMA IF NOT EXISTS ${this.schemaName}`)

    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name', 255).notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).nullable() // Nullable for OAuth users
      table.enum('role', ['employee', 'admin']).defaultTo('employee')
      table.string('provider', 50).nullable()
      table.string('provider_id', 255).nullable()
      table.string('status', 50).defaultTo('active')
      table.integer('leave_limit').defaultTo(12)
      
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.withSchema(this.schemaName).dropTable(this.tableName)
  }
}
