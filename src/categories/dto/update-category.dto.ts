import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Transport',
    description: 'Category name',
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @ApiPropertyOptional({
    example: '#3366FF',
    description: 'Category color in HEX format',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color?: string;
}
