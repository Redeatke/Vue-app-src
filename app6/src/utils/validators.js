const usernameRules = [
  {
    name: 'minLength',
    test: (v) => v.length >= 5,
    errorMessage: 'Must have at least 5 characters'
  },
  {
    name: 'maxLength',
    test: (v) => v.length <= 16,
    errorMessage: 'Cannot have more than 16 characters'
  },
  {
    name: 'beginWithLetter',
    test: (v) => /^[a-zA-Z]/.test(v),
    errorMessage: 'Must begin with a letter'
  },
  {
    name: 'containOnlyAlphaNumeric',
    test: (v) => /^[a-zA-Z0-9]+$/.test(v),
    errorMessage: 'Can only contain letters and numbers'
  }
]

const passwordRules = [
  {
    name: 'minLength',
    test: (v) => v.length >= 8,
    errorMessage: 'Must have at least 8 characters'
  },
  {
    name: 'maxLength',
    test: (v) => v.length <= 64,
    errorMessage: 'Cannot have more than 64 characters'
  },
  {
    name: 'hasUpper',
    test: (v) => /[A-Z]/.test(v),
    errorMessage: 'Must have 1 uppercase character'
  },
  {
    name: 'hasLower',
    test: (v) => /[a-z]/.test(v),
    errorMessage: 'Must have 1 lowercase character'
  },
  {
    name: 'hasNumber',
    test: (v) => /[0-9]/.test(v),
    errorMessage: 'Must have 1 number'
  },
  {
    name: 'hasSpecial',
    test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
    errorMessage: 'Must have 1 special character'
  }
]

export function validateUsername(username) {
  const errors = []
  for (const rule of usernameRules) {
    if (!rule.test(username)) {
      errors.push(rule.errorMessage)
    }
  }
  return errors
}

export function validatePassword(password) {
  const errors = []
  const trimmed = password?.trim()
  for (const rule of passwordRules) {
    if (!rule.test(trimmed)) {
      errors.push(rule.errorMessage)
    }
  }
  return errors
}
