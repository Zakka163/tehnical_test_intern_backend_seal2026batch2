import { DateTime } from 'luxon'
import { column, BaseModel, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import LeaveRequest from 'App/Models/LeaveRequest'
import ApiToken from 'App/Models/ApiToken'

export default class User extends BaseModel {
  public static table = 'sistem_cuti.users'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password?: string

  @column()
  public role: 'employee' | 'admin'

  @column()
  public provider?: string

  @column()
  public providerId?: string

  @column()
  public status: string

  @column()
  public leaveLimit: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => LeaveRequest)
  public leaveRequests: HasMany<typeof LeaveRequest>

  @hasMany(() => ApiToken)
  public apiTokens: HasMany<typeof ApiToken>
}
