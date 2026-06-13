import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class LeaveRequests extends BaseSchema {
  protected tableName = 'leave_requests'
  protected schemaName = 'sistem_cuti'

  public async up () {
    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable(`${this.schemaName}.users`).onDelete('CASCADE')
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.text('reason').notNullable()
      table.string('attachment', 255).nullable()
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending')

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
