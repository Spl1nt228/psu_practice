import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  categoryId: string;

  @ApiProperty({
    example: '25.50',
    description: 'Transaction amount',
  })
  amount: string | number;

  @ApiProperty({
    enum: ['expense', 'income'],
    example: 'expense',
  })
  type: 'expense' | 'income';

  @ApiPropertyOptional({
    example: 'Lunch at work',
    description: 'Short transaction description',
  })
  description?: string;

  @ApiProperty({
    example: '2026-06-10T09:30:00.000Z',
    description: 'Transaction date',
  })
  date: string;
}
