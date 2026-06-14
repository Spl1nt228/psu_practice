export const TRANSACTION_MESSAGES = {
  NOT_FOUND: 'Transaction not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  EMPTY_UPDATE: 'At least one transaction field must be provided',
  INVALID_AMOUNT: 'Amount must be a valid number',
  AMOUNT_NOT_POSITIVE: 'Amount must be greater than zero',
  DESCRIPTION_TOO_LONG: 'Description must be 255 characters or less',
  INVALID_DATE: 'Date must be a valid date',
  FUTURE_DATE: 'Date must not be in the future',
} as const;
