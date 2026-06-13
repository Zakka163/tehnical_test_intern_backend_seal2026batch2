import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import LeaveRequest from 'App/Models/LeaveRequest'
import Database from '@ioc:Adonis/Lucid/Database'

export default class AdminLeaveRequestsController {

  public async index({ request, response }: HttpContextContract) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const status = request.input('status')
    const name = request.input('name')
    const month = request.input('month')
    const year = request.input('year')

    const query = LeaveRequest.query()
      .preload('user', (userQuery) => {
        userQuery.select('id', 'name', 'email', 'role', 'leaveLimit')
      })
      .orderBy('created_at', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (name) {
      query.whereHas('user', (userQuery) => {
        userQuery.whereRaw('LOWER(name) LIKE ?', [`%${name.toLowerCase()}%`])
      })
    }

    if (month) {
      query.whereRaw('EXTRACT(MONTH FROM start_date) = ?', [month])
    }

    if (year) {
      query.whereRaw('EXTRACT(YEAR FROM start_date) = ?', [year])
    }

    const leaveRequests = await query.paginate(page, limit)

    return response.ok({
      message: 'Leave requests retrieved successfully',
      data: leaveRequests,
    })
  }


  /**
   * Update a leave request status (Approve / Reject)
   */
  public async updateStatus({ request, params, response }: HttpContextContract) {
    const statusSchema = schema.create({
      status: schema.enum(['approved', 'rejected'] as const),
    })

    const payload = await request.validate({ schema: statusSchema })
    const leaveRequest = await LeaveRequest.find(params.id)

    if (!leaveRequest) {
      return response.notFound({ message: 'Leave request not found' })
    }

    if (leaveRequest.status !== 'pending') {
      return response.badRequest({ message: `Cannot update. Request is already ${leaveRequest.status}` })
    }

    if (payload.status === 'approved') {
      await leaveRequest.load('user')
      const user = leaveRequest.user

      const diffInDays = leaveRequest.endDate.diff(leaveRequest.startDate, 'days').days + 1

      if (diffInDays > user.leaveLimit) {
        return response.badRequest({
          message: `User does not have enough leave balance to approve this request. Needed: ${diffInDays}, Available: ${user.leaveLimit}`,
        })
      }

      const trx = await Database.transaction()

      try {
        user.leaveLimit -= diffInDays
        user.useTransaction(trx)
        await user.save()

        leaveRequest.status = 'approved'
        leaveRequest.useTransaction(trx)
        await leaveRequest.save()

        await trx.commit()

        return response.ok({
          message: 'Leave request approved successfully',
          data: leaveRequest,
        })
      } catch (error) {
        await trx.rollback()
        return response.internalServerError({
          message: 'Failed to approve leave request',
          error: error.message,
        })
      }
    } else if (payload.status === 'rejected') {
      leaveRequest.status = 'rejected'
      await leaveRequest.save()

      return response.ok({
        message: 'Leave request rejected successfully',
        data: leaveRequest,
      })
    }
  }
}
