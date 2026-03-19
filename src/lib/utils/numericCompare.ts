const NUMERIC_LITERAL_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

type ParsedNumeric = {
  sign: 1 | -1;
  digits: string;
  exp: number;
  isZero: boolean;
};

const parseNumericLiteral = (raw: string): ParsedNumeric | null => {
  const input = raw.trim();
  if (!NUMERIC_LITERAL_REGEX.test(input)) {
    return null;
  }

  let sign: 1 | -1 = 1;
  let body = input;

  if (body.startsWith('+')) {
    body = body.slice(1);
  } else if (body.startsWith('-')) {
    sign = -1;
    body = body.slice(1);
  }

  const [mantissa, expPart] = body.split(/e/i);
  let exp = expPart ? Number.parseInt(expPart, 10) : 0;

  const [integerPart, fractionalPart = ''] = mantissa.split('.');
  let digits = `${integerPart}${fractionalPart}`.replace(/^0+/, '');

  if (!digits) {
    return {
      sign: 1,
      digits: '0',
      exp: 0,
      isZero: true,
    };
  }

  exp -= fractionalPart.length;

  while (digits.endsWith('0')) {
    digits = digits.slice(0, -1);
    exp += 1;
  }

  return {
    sign,
    digits,
    exp,
    isZero: false,
  };
};

const compareScaledIntegers = (a: ParsedNumeric, b: ParsedNumeric): number => {
  const minExp = Math.min(a.exp, b.exp);
  const aScaled = `${a.digits}${'0'.repeat(a.exp - minExp)}`;
  const bScaled = `${b.digits}${'0'.repeat(b.exp - minExp)}`;

  if (aScaled.length !== bScaled.length) {
    return aScaled.length > bScaled.length ? 1 : -1;
  }

  if (aScaled === bScaled) {
    return 0;
  }

  return aScaled > bScaled ? 1 : -1;
};

const isValidNumericLiteral = (value: string): boolean => {
  return parseNumericLiteral(value) !== null;
};

const compareNumericLiterals = (aRaw: string, bRaw: string): number | null => {
  const a = parseNumericLiteral(aRaw);
  const b = parseNumericLiteral(bRaw);

  if (!a || !b) {
    return null;
  }

  if (a.isZero && b.isZero) {
    return 0;
  }

  if (a.sign !== b.sign) {
    return a.sign > b.sign ? 1 : -1;
  }

  const aMagnitude = a.digits.length + a.exp;
  const bMagnitude = b.digits.length + b.exp;

  let result: number;
  if (aMagnitude !== bMagnitude) {
    result = aMagnitude > bMagnitude ? 1 : -1;
  } else {
    result = compareScaledIntegers(a, b);
  }

  return a.sign === 1 ? result : -result;
};

export { isValidNumericLiteral, compareNumericLiterals };
