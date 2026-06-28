export type CardBrand = 'visa' | 'mastercard' | 'unknown';

export type CardBrandInfo = {
  brand: CardBrand;
  label: string;
  lengths: number[];
  cvvLength: number;
};

const VISA: CardBrandInfo = {
  brand: 'visa',
  label: 'Visa',
  lengths: [16, 19],
  cvvLength: 3,
};

const MASTERCARD: CardBrandInfo = {
  brand: 'mastercard',
  label: 'Mastercard',
  lengths: [16],
  cvvLength: 3,
};

const UNKNOWN: CardBrandInfo = {
  brand: 'unknown',
  label: '',
  lengths: [16],
  cvvLength: 3,
};

/** Detect card network from the leading digits (BIN/IIN). */
export function detectCardBrand(digits: string): CardBrandInfo {
  if (/^4/.test(digits)) return VISA;
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return MASTERCARD;
  return UNKNOWN;
}

/** Luhn checksum — standard card number validation. */
export function luhnCheck(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function maxCardDigits(brand: CardBrandInfo): number {
  return Math.max(...brand.lengths);
}

export function formatCardDigits(raw: string, brand: CardBrandInfo): string {
  const digits = raw.replace(/\D/g, '').slice(0, maxCardDigits(brand));
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export type CardNumberValidation = {
  valid: boolean;
  brand: CardBrandInfo;
  message?: string;
};

export function validateCardNumber(digits: string): CardNumberValidation {
  const brand = detectCardBrand(digits);

  if (digits.length === 0) {
    return { valid: false, brand };
  }

  if (brand.brand === 'unknown') {
    if (digits.length >= 2) {
      return {
        valid: false,
        brand,
        message: 'Only Visa and Mastercard are accepted',
      };
    }
    return { valid: false, brand };
  }

  const targetLength = brand.lengths[0];
  if (digits.length < targetLength) {
    return { valid: false, brand };
  }

  if (!brand.lengths.includes(digits.length)) {
    return {
      valid: false,
      brand,
      message: `${brand.label} cards use ${brand.lengths.join(' or ')} digits`,
    };
  }

  if (!luhnCheck(digits)) {
    return { valid: false, brand, message: `Invalid ${brand.label} card number` };
  }

  return { valid: true, brand };
}
