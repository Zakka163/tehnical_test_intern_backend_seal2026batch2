import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import LeaveRequest from 'App/Models/LeaveRequest'
import Application from '@ioc:Adonis/Core/Application'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

export default class LeaveRequestsController {
  public async index({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user!

    const leaveRequests = await LeaveRequest.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')

    return response.ok({
      message: 'Leave requests retrieved successfully',
      data: leaveRequests,
    })
  }

  public async store({ request, auth, response }: HttpContextContract) {
    const user = auth.use('api').user!


    const leaveSchema = schema.create({
      start_date: schema.date({ format: 'yyyy-MM-dd' }),
      end_date: schema.date({ format: 'yyyy-MM-dd' }),
      reason: schema.string({ trim: true }, [
        rules.minLength(5)
      ]),
      attachment: schema.file.optional({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg', 'pdf'],
      }),
    })

    const payload = await request.validate({ schema: leaveSchema })


    const startDate = payload.start_date
    const endDate = payload.end_date

    const today = DateTime.now().startOf('day')
    if (startDate < today) {
      return response.badRequest({
        message: 'Start date cannot be in the past',
      })
    }
    if (endDate < startDate) {
      return response.badRequest({
        message: 'End date cannot be earlier than start date',
      })
    }

    const diffInDays = endDate.diff(startDate, 'days').days + 1

    // Menghitung total hari dari pengajuan cuti yang masih 'pending'
    const pendingRequests = await LeaveRequest.query()
      .where('user_id', user.id)
      .andWhere('status', 'pending')

    let pendingDays = 0
    for (const req of pendingRequests) {
      pendingDays += req.endDate.diff(req.startDate, 'days').days + 1
    }

    const totalRequestedDays = pendingDays + diffInDays

    if (totalRequestedDays > user.leaveLimit) {
      return response.badRequest({
        message: `Insufficient leave balance. You have ${user.leaveLimit} days left. Your pending requests use ${pendingDays} days, and this new request needs ${diffInDays} days (Total: ${totalRequestedDays} days).`,
      })
    }


    let attachmentPath: string | null = null
    if (payload.attachment) {
      const fileName = `${new Date().getTime()}_${payload.attachment.clientName}`
      await payload.attachment.move(Application.tmpPath('uploads'), {
        name: fileName,
      })
      attachmentPath = `uploads/${fileName}`
    }

    const trx = await Database.transaction()

    try {

      const leaveRequest = new LeaveRequest()
      leaveRequest.userId = user.id
      leaveRequest.startDate = startDate
      leaveRequest.endDate = endDate
      leaveRequest.reason = payload.reason
      leaveRequest.status = 'pending'
      if (attachmentPath) {
        leaveRequest.attachment = attachmentPath
      }

      leaveRequest.useTransaction(trx)
      await leaveRequest.save()

      await trx.commit()

      return response.created({
        message: 'Leave request submitted successfully',
        data: leaveRequest,
      })
    } catch (error) {
      await trx.rollback()
      return response.internalServerError({
        message: 'Failed to submit leave request',
        error: error.message,
      })
    }
  }
}
