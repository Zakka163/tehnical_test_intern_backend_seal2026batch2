const hashConfig = {
  default: 'bcrypt' as const,
  list: {
    bcrypt: {
      driver: 'bcrypt' as const,
      rounds: 10,
    },
    argon: {
      driver: 'argon2' as const,
      variant: 'id' as const,
      iterations: 3,
      memory: 4096,
      parallelism: 1,
      saltSize: 16,
    },
  },
}

export default hashConfig
