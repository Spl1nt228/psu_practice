export const TRANSACTION_MESSAGES = {
  NOT_FOUND: 'Transaction not found',
  CATEGORY_NOT_FOUND: 'Category not found',
  EMPTY_UPDATE: 'At least one transaction field must be provided',
  DESCRIPTION_TOO_LONG: 'Description must be 255 characters or less',
  INVALID_DATE: 'Date must be a valid date',
  FUTURE_DATE: 'Date must not be in the future',
  INVALID_DATE_RANGE: 'dateFrom must be less than or equal to dateTo',
  BUDGET_LIMIT_EXCEEDED: 'Budget limit exceeded',
} as const;
