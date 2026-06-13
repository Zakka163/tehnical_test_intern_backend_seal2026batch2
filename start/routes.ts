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


  Route.group(() => {
    Route.get('/leave-requests', 'LeaveRequestsController.index')
    Route.post('/leave-requests', 'LeaveRequestsController.store')
  }).middleware(['auth', 'role:employee'])

}).prefix('/api')
