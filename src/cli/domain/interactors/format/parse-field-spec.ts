import { UserError } from '@/cli/domain/exceptions';

/**
 * The seven user-selectable field-type tokens. The internal `keyvalue` token
 * is deliberately absent: it is never offered and is rejected as unknown.
 */
export type FormatFieldTypeToken = 'string' | 'text' | 'markdown' | 'date' | 'number' | 'image' | 'file';

export const FORMAT_FIELD_TYPE_TOKENS: readonly FormatFieldTypeToken[] = [
  'string',
  'text',
  'markdown',
  'date',
  'number',
  'image',
  'file',
];

export const MIN_FORMAT_FIELD_COUNT = 1;
export const MAX_FORMAT_FIELD_COUNT = 20;
export const MAX_FORMAT_NAME_LENGTH = 60;
export const MAX_FIELD_NAME_LENGTH = 40;
export const RESERVED_FORMAT_NAME = 'Post';
export const ASSET_URL_PREFIX = 'assets/';

const FIELD_NAME_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * One typed field slot assembled from a `--field` spec or an interactive
 * answer: the four wire attributes with an implicitly empty description in
 * flag mode.
 */
export interface FieldSpec {
  name: string;
  description: string;
  type: FormatFieldTypeToken;
  defaultValue: string | number;
}

const isFormatFieldTypeToken = (token: string): token is FormatFieldTypeToken =>
  (FORMAT_FIELD_TYPE_TOKENS as readonly string[]).includes(token);

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) {
    return 30;
  }
  return 31;
};

const isCalendarDate = (value: string): boolean => {
  const match = ISO_DATE_PATTERN.exec(value);
  if (match === null) {
    return false;
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 1 || month > 12) {
    return false;
  }
  return day >= 1 && day <= daysInMonth(year, month);
};

const isAssetUrl = (value: string): boolean =>
  value.length > ASSET_URL_PREFIX.length && value.startsWith(ASSET_URL_PREFIX);

/**
 * The default applied when a spec omits the default segment: the number 0
 * for `number`, the empty string for every other type.
 */
export const emptyDefaultForType = (type: FormatFieldTypeToken): string | number => {
  if (type === 'number') {
    return 0;
  }
  return '';
};

/**
 * Format-name rule: non-empty, at most 60 characters, and not the reserved
 * native name `Post` (case-insensitive). Returns the violation message or
 * null when the name is valid.
 */
export const formatNameViolation = (name: string): string | null => {
  if (name.length === 0) {
    return 'Format name must be a non-empty string';
  }
  if (name.length > MAX_FORMAT_NAME_LENGTH) {
    return `Format name must be at most ${MAX_FORMAT_NAME_LENGTH} characters (got ${name.length})`;
  }
  if (name.toLowerCase() === RESERVED_FORMAT_NAME.toLowerCase()) {
    return `Format name '${name}' is reserved for the native format`;
  }
  return null;
};

/**
 * Field-name rule: a camelCase identifier — a lowercase letter first, then
 * letters or digits, at most 40 characters. Returns the violation message or
 * null when the name is valid.
 */
export const fieldNameViolation = (name: string): string | null => {
  if (name.length === 0 || !FIELD_NAME_PATTERN.test(name)) {
    return `Field name '${name}' must be a camelCase identifier starting with a lowercase letter, followed by letters or digits`;
  }
  if (name.length > MAX_FIELD_NAME_LENGTH) {
    return `Field name must be at most ${MAX_FIELD_NAME_LENGTH} characters (got ${name.length})`;
  }
  return null;
};

/**
 * Type-token rule: the token must be one of the seven user-selectable ones.
 * The internal `keyvalue` token fails this check like any other unknown
 * token. Returns the violation message or null when the token is valid.
 */
export const fieldTypeViolation = (type: string): string | null => {
  if (!isFormatFieldTypeToken(type)) {
    return `Unknown field type '${type}'. The supported types are: ${FORMAT_FIELD_TYPE_TOKENS.join(', ')}`;
  }
  return null;
};

/**
 * Default-value rule applied to raw text (a `--field` default segment or an
 * interactive answer): any string for `string`, `text`, and `markdown`; the
 * empty string or a real `YYYY-MM-DD` calendar date for `date`; a finite
 * number for `number`; the empty string or an `assets/` URL for `image` and
 * `file`. Returns the violation message or null when the text is valid.
 */
export const fieldTextDefaultViolation = (type: FormatFieldTypeToken, text: string): string | null => {
  if (type === 'string' || type === 'text' || type === 'markdown') {
    return null;
  }
  if (type === 'date') {
    if (text === '' || isCalendarDate(text)) {
      return null;
    }
    return `The '${type}' default must be empty or a YYYY-MM-DD calendar date (got '${text}')`;
  }
  if (type === 'number') {
    const parsed = Number(text.trim());
    if (text.trim() !== '' && Number.isFinite(parsed)) {
      return null;
    }
    return `The 'number' default must be a finite number (got '${text}')`;
  }
  if (text === '' || isAssetUrl(text)) {
    return null;
  }
  return `The '${type}' default must be empty or a path beginning with 'assets/' (got '${text}')`;
};

/**
 * Converts a validated raw-text default into the stored value: a finite
 * number for `number`, the text itself for every other type.
 */
export const fieldDefaultTextToValue = (type: FormatFieldTypeToken, text: string): string | number => {
  if (type === 'number') {
    return Number(text.trim());
  }
  return text;
};

/**
 * Field-list rules: names must be unique within the assembled list, and the
 * list must contain between 1 and 20 fields. Returns the violation message
 * or null when the list is valid.
 */
export const fieldListViolation = (fields: FieldSpec[]): string | null => {
  if (fields.length < MIN_FORMAT_FIELD_COUNT || fields.length > MAX_FORMAT_FIELD_COUNT) {
    return `A format must declare between ${MIN_FORMAT_FIELD_COUNT} and ${MAX_FORMAT_FIELD_COUNT} fields (got ${fields.length})`;
  }
  const seen = new Set<string>();
  for (const field of fields) {
    if (seen.has(field.name)) {
      return `Duplicate field name '${field.name}' in format definition`;
    }
    seen.add(field.name);
  }
  return null;
};

/**
 * Validates an assembled definition before any SDK call, raising a
 * `UserError` carrying the first violated rule so `Runtime` renders it.
 */
export const assertValidFormatDefinition = (name: string, fields: FieldSpec[]): void => {
  const nameViolation = formatNameViolation(name);
  if (nameViolation !== null) {
    throw new UserError(nameViolation);
  }
  for (const field of fields) {
    const violation = fieldNameViolation(field.name) ?? fieldTypeViolation(field.type) ?? fieldTextDefaultViolation(field.type, String(field.defaultValue));
    if (violation !== null) {
      throw new UserError(violation);
    }
  }
  const listViolation = fieldListViolation(fields);
  if (listViolation !== null) {
    throw new UserError(listViolation);
  }
};

/**
 * Pure parser for the `--field` grammar `name:type:default`.
 *
 * The spec is split on every colon and each segment is trimmed. Two
 * segments (`name:type`) mean the default is omitted and the type's empty
 * default applies — the number 0 for `number`, the empty string otherwise.
 * Three segments carry the default explicitly. One segment means the type
 * is missing; four or more mean the default itself contains a colon, which
 * the grammar cannot express — both are malformed and the error message
 * points at the interactive flow, where defaults of any shape can be
 * entered.
 */
export class ParseFieldSpec {
  public parse(spec: string): FieldSpec {
    const segments = spec.split(':').map((segment) => segment.trim());

    if (segments.length === 1) {
      throw new UserError(
        `Invalid --field spec '${spec}': the field type is missing. Use name:type or name:type:default`
      );
    }
    if (segments.length >= 4) {
      throw new UserError(
        `Invalid --field spec '${spec}': the default value contains a colon, which the --field grammar cannot express. Run the interactive flow (omit --field) to enter defaults of any shape`
      );
    }

    const [name, type, defaultSegment] = segments;

    if (name === '') {
      throw new UserError(`Invalid --field spec '${spec}': the field name segment is empty`);
    }
    const typeViolation = fieldTypeViolation(type);
    if (typeViolation !== null) {
      throw new UserError(`Invalid --field spec '${spec}': ${typeViolation}`);
    }

    const typedType = type as FormatFieldTypeToken;
    let defaultValue: string | number;
    if (defaultSegment === undefined) {
      defaultValue = emptyDefaultForType(typedType);
    } else if (defaultSegment === '') {
      throw new UserError(
        `Invalid --field spec '${spec}': the default segment is empty; omit it (name:type) to use the type's empty default`
      );
    } else {
      const defaultViolation = fieldTextDefaultViolation(typedType, defaultSegment);
      if (defaultViolation !== null) {
        throw new UserError(`Invalid --field spec '${spec}': ${defaultViolation}`);
      }
      defaultValue = fieldDefaultTextToValue(typedType, defaultSegment);
    }

    const nameViolation = fieldNameViolation(name);
    if (nameViolation !== null) {
      throw new UserError(`Invalid --field spec '${spec}': ${nameViolation}`);
    }

    return { name, description: '', type: typedType, defaultValue };
  }
}
