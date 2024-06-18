

export function validateUsername(username: string): {
  isValid: boolean,
  errorText: string
} {
  if (!username || username.trim().length < 3) {
    return {
      isValid: false,
      errorText: 'Username must be at least 3 characters'
    }
  }
  if (username.length > 15) {
    return {
      isValid: false,
      errorText: 'Username must be less than or equal to 15 characters'
    }
  }
  if (containsInvalidCharacters(username)) {
    return {
      isValid: false,
      errorText: 'Username contains invalid characters'
    }
  }
  return {
    isValid: true,
    errorText: ''
  }
}

export function validatePassword(password: string): {
  isValid: boolean,
  errorText: string
} {
  if (!password || password.trim().length < 3) {
    return {
      isValid: false,
      errorText: 'Password must be at least 3 characters'
    }
  }
  if (containsInvalidCharacters(password)) {
    return {
      isValid: false,
      errorText: 'Password contains invalid characters'
    }
  }
  return {
    isValid: true,
    errorText: ''
  }
}

function containsInvalidCharacters(text: string) {
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      return true;
    }
  }
  return false;
}