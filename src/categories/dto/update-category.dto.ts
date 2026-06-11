import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    example: 'Transport',
    description: 'Category name',
  })
  name?: string;

  @ApiPropertyOptional({
    example: '#3366FF',
    description: 'Category color in HEX format',
  })
  color?: string;
}
