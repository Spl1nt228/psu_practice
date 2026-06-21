import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: 25.5,
    description: 'Transaction amount',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    enum: TransactionType,
    example: 'expense',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    example: 'Lunch at work',
    description: 'Short transaction description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: '2026-06-10T09:30:00.000Z',
    description: 'Transaction date. Must not be later than current date.',
  })
  @IsDateString()
  date: string;
}
