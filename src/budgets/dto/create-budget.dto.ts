import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    example: '2b7f5a34-5d3b-4c16-8c20-823b9b1e3f2a',
    description: 'Category id',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    example: 500,
    description: 'Monthly budget limit',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  limit: number;

  @ApiProperty({
    example: 2026,
    description: 'Budget year',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(9999)
  year: number;

  @ApiProperty({
    example: 6,
    description: 'Budget month number',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
