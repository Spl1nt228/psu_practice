import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Food',
    description: 'Category name',
  })
  name: string;

  @ApiProperty({
    example: '#FFAA00',
    description: 'Category color in HEX format',
  })
  color: string;
}
