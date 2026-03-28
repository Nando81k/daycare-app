export const PASSWORD_POLICY = {
  minLength: 12,
} as const;

export interface PasswordRule {
  key: 'length' | 'lower' | 'upper' | 'number' | 'special' | 'no_spaces';
  label: string;
  passed: boolean;
}

function hasLower(password: string) {
  return /[a-z]/.test(password);
}

function hasUpper(password: string) {
  return /[A-Z]/.test(password);
}

function hasNumber(password: string) {
  return /\d/.test(password);
}

function hasSpecial(password: string) {
  return /[^A-Za-z0-9\s]/.test(password);
}

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    {
      key: 'length',
      label: `At least ${PASSWORD_POLICY.minLength} characters`,
      passed: password.length >= PASSWORD_POLICY.minLength,
    },
    {
      key: 'lower',
      label: 'At least one lowercase letter',
      passed: hasLower(password),
    },
    {
      key: 'upper',
      label: 'At least one uppercase letter',
      passed: hasUpper(password),
    },
    {
      key: 'number',
      label: 'At least one number',
      passed: hasNumber(password),
    },
    {
      key: 'special',
      label: 'At least one special character',
      passed: hasSpecial(password),
    },
    {
      key: 'no_spaces',
      label: 'No spaces',
      passed: !/\s/.test(password),
    },
  ];
}

export function getPasswordStrength(password: string) {
  const rules = getPasswordRules(password);
  const passed = rules.filter((rule) => rule.passed).length;

  let score = 0;
  if (passed >= 2) score = 1;
  if (passed >= 4) score = 2;
  if (passed >= 5) score = 3;
  if (passed === rules.length) score = 4;

  const label =
    score <= 1
      ? 'Weak'
      : score === 2
        ? 'Fair'
        : score === 3
          ? 'Strong'
          : 'Very strong';

  return {
    score,
    label,
    rules,
    isValid: rules.every((rule) => rule.passed),
  };
}

export function getPasswordValidationErrors(password: string) {
  return getPasswordRules(password)
    .filter((rule) => !rule.passed)
    .map((rule) => rule.label);
}
