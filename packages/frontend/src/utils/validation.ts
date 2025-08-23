export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: string, rules: ValidationRule): string | undefined => {
  if (rules.required && !value.trim()) {
    return 'This field is required';
  }

  if (value.trim()) {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rules.custom) {
      return rules.custom(value);
    }
  }

  return undefined;
};

export const validateForm = (data: { [key: string]: string }, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field] || '';
    const fieldRules = rules[field];
    const error = validateField(value, fieldRules);
    
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
};

// Common validation rules
export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.email,
  },
  password: {
    required: true,
    minLength: 6,
    pattern: VALIDATION_PATTERNS.password,
  },
  confirmPassword: (password: string) => ({
    required: true,
    custom: (value: string) => {
      if (value !== password) {
        return 'Passwords do not match';
      }
      return undefined;
    },
  }),
  businessEntityId: {
    minLength: 3,
    maxLength: 50,
  },
};
