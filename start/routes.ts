import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {

  Route.group(() => {
    Route.post('/login', 'AuthController.login')

    Route.get('/google/redirect', 'AuthController.googleRedirect')
    Route.get('/google/callback', 'AuthController.googleCallback')
  }).prefix('/auth')

  Route.group(() => {
    Route.get('/me', 'AuthController.me')
    Route.post('/logout', 'AuthController.logout')
  }).prefix('/auth').middleware('auth')


  // Protected application routes (Leave Requests - Employee Only)
  Route.group(() => {
    Route.get('/leave-requests', 'LeaveRequestsController.index')
    Route.post('/leave-requests', 'LeaveRequestsController.store')
  }).middleware(['auth', 'role:employee'])

  // Protected application routes (Admin Only)
  Route.group(() => {
    Route.get('/leave-requests', 'AdminLeaveRequestsController.index')
    Route.patch('/leave-requests/:id/status', 'AdminLeaveRequestsController.updateStatus')
  }).prefix('/admin').middleware(['auth', 'role:admin'])

}).prefix('/api')
