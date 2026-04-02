export interface PasswordStrength {
  score: number;
  level: "weak" | "medium" | "strong";
  color: string;
  message: string;
  isValid: boolean;
  requirements: PasswordRequirement[];
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
}

const MIN_PASSWORD_LENGTH = 8;

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  const requirements: PasswordRequirement[] = [
    {
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    { label: "Contains uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "Contains number (0-9)", met: /\d/.test(password) },
    {
      label: "Contains special character (!@#$%^&*etc)",
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
  ];

  if (!password) {
    return {
      score: 0,
      level: "weak",
      color: "#dc2626",
      message: "Password is required",
      isValid: false,
      requirements,
    };
  }

  // Check minimum length
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      score: 0,
      level: "weak",
      color: "#dc2626",
      message: `Minimum ${MIN_PASSWORD_LENGTH} characters required`,
      isValid: false,
      requirements,
    };
  }

  // Length points (up to 3 points)
  if (password.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Lowercase letters
  if (/[a-z]/.test(password)) score += 1;

  // Uppercase letters
  if (/[A-Z]/.test(password)) score += 1;

  // Numbers
  if (/\d/.test(password)) score += 1;

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Determine level and color
  let level: "weak" | "medium" | "strong";
  let color: string;
  let message: string;

  if (score <= 2) {
    level = "weak";
    color = "#dc2626"; // red
    message = "Weak - Try adding more character variety";
  } else if (score <= 4) {
    level = "medium";
    color = "#f59e0b"; // amber/orange
    message = "Medium - Consider adding more character variety";
  } else {
    level = "strong";
    color = "#16a34a"; // green
    message = "Strong password";
  }

  return {
    score: Math.min(score, 7),
    level,
    color,
    message,
    isValid: password.length >= MIN_PASSWORD_LENGTH,
    requirements,
  };
}

export const MIN_PASSWORD_LEN = MIN_PASSWORD_LENGTH;

// Export this to indicate we allow weak passwords
export const ALLOW_WEAK_PASSWORDS = true;
