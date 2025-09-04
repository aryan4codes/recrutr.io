// PII masking utilities

export interface RedactionConfig {
  emails: boolean
  phones: boolean
  names: boolean
  addresses: boolean
  ssn: boolean
}

const DEFAULT_CONFIG: RedactionConfig = {
  emails: true,
  phones: true,
  names: false, // Keep names for context in recruiting
  addresses: true,
  ssn: true
}

export function redactPII(text: string, config: Partial<RedactionConfig> = {}): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  let redacted = text

  if (finalConfig.emails) {
    // Redact email addresses
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL_REDACTED]'
    )
  }

  if (finalConfig.phones) {
    // Redact phone numbers (various formats)
    redacted = redacted.replace(
      /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      '[PHONE_REDACTED]'
    )
    
    // Indian phone numbers
    redacted = redacted.replace(
      /(\+91[-\s]?)?[6-9]\d{9}/g,
      '[PHONE_REDACTED]'
    )
  }

  if (finalConfig.addresses) {
    // Basic address patterns (can be improved)
    redacted = redacted.replace(
      /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Drive|Dr|Way|Place|Pl|Boulevard|Blvd)/gi,
      '[ADDRESS_REDACTED]'
    )
  }

  if (finalConfig.ssn) {
    // SSN patterns
    redacted = redacted.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      '[SSN_REDACTED]'
    )
  }

  return redacted
}

export function createRedactedVersion(
  originalText: string, 
  config?: Partial<RedactionConfig>
): { original: string; redacted: string; hasPII: boolean } {
  const redacted = redactPII(originalText, config)
  const hasPII = redacted !== originalText

  return {
    original: originalText,
    redacted,
    hasPII
  }
}

export function shouldRedactForModel(text: string): boolean {
  // Simple heuristic to determine if text likely contains PII
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const phonePattern = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/
  const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/

  return emailPattern.test(text) || phonePattern.test(text) || ssnPattern.test(text)
}
