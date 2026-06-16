import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

enum TransactionSortBy {
  date = 'date',
  amount = 'amount',
}

enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export class FindTransactionsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Start date',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.999Z',
    description: 'End date',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    enum: TransactionType,
    example: TransactionType.expense,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'lunch',
    description: 'Search by transaction description',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({
    enum: TransactionSortBy,
    default: TransactionSortBy.date,
  })
  @IsOptional()
  @IsEnum(TransactionSortBy)
  sortBy?: TransactionSortBy;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.desc,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
