import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpdateBudgetDto {
  @ApiPropertyOptional({
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 700,
    description: 'Monthly budget limit',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  limit?: number;

  @ApiPropertyOptional({
    example: 2026,
    description: 'Budget year',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(9999)
  year?: number;

  @ApiPropertyOptional({
    example: 6,
    description: 'Budget month number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
