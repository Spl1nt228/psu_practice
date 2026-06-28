import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

import { SortOrder } from '../../common/dto/sort-order.enum';

enum BudgetSortBy {
  createdAt = 'createdAt',
  year = 'year',
  month = 'month',
  limit = 'limit',
}

export class FindBudgetsQueryDto {
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
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 2026,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(9999)
  year?: number;

  @ApiPropertyOptional({
    example: 6,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    enum: BudgetSortBy,
    default: BudgetSortBy.createdAt,
  })
  @IsOptional()
  @IsEnum(BudgetSortBy)
  sortBy?: BudgetSortBy;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.desc,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
