import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoriesQueryDto } from './dto/find-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create category' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get categories list' })
  findAll(@Query() query: FindCategoriesQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete category' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.categoriesService.remove(id);
  }
}
