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

export const logger = {
  name: Env.get('APP_NAME', 'sistem_cuti'),
  enabled: true,
  level: Env.get('LOG_LEVEL', 'info'),
  prettyPrint: Env.get('NODE_ENV') === 'development',
}

export const profiler = {
  enabled: true,
  blacklist: [],
  whitelist: [],
}

export const validator = {}
