import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Food',
    description: 'Category name',
  })
  @IsString()
  @Length(2, 50)
  name: string;

  @ApiProperty({
    example: '#FFAA00',
    description: 'Category color in HEX format',
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  color: string;
}
