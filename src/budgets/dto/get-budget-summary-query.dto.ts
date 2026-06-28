import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class GetBudgetSummaryQueryDto {
  @ApiProperty({
    example: 2026,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(9999)
  year: number;

  @ApiProperty({
    example: 6,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
