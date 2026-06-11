import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  categoryId?: string;

  @ApiPropertyOptional({
    example: '35.75',
    description: 'Transaction amount',
  })
  amount?: string | number;

  @ApiPropertyOptional({
    enum: ['expense', 'income'],
    example: 'income',
  })
  type?: 'expense' | 'income';

  @ApiPropertyOptional({
    example: 'Updated description',
  })
  description?: string;

  @ApiPropertyOptional({
    example: '2026-06-10T09:30:00.000Z',
    description: 'Transaction date',
  })
  date?: string;
}
