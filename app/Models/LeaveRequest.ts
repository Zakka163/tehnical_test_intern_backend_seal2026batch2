import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from 'App/Models/User'

export default class LeaveRequest extends BaseModel {
  public static table = 'sistem_cuti.leave_requests'

  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column.date()
  public startDate: DateTime

  @column.date()
  public endDate: DateTime

  @column()
  public reason: string

  @column()
  public attachment?: string

  @column()
  public status: 'pending' | 'approved' | 'rejected'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
