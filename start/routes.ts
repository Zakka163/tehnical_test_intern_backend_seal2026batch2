import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  // ─── Auth Routes ───────────────────────────────────────────────────────────

  // Public routes (no authentication required)
  Route.group(() => {
    Route.post('/login', 'AuthController.login')

    // Google OAuth
    Route.get('/google/redirect', 'AuthController.googleRedirect')
    Route.get('/google/callback', 'AuthController.googleCallback')
  }).prefix('/auth')

  // Protected routes (authentication required)
  Route.group(() => {
    Route.post('/logout', 'AuthController.logout')
  }).prefix('/auth').middleware('auth')

}).prefix('/api')
