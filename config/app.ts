import Env from '@ioc:Adonis/Core/Env'

export const appKey = Env.get('APP_KEY')

export const http = {
  trustProxy: () => true,
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: false,
    sameSite: false,
  },
}
