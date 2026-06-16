import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CATEGORY_MESSAGES } from './categories.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { FindCategoriesQueryDto } from './dto/find-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: createCategoryDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: FindCategoriesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private buildWhere(query: FindCategoriesQueryDto) {
    const where: Prisma.CategoryWhereInput = {};
    const search = query.search?.trim();

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private buildOrderBy(query: FindCategoriesQueryDto) {
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    return {
      [sortBy]: sortOrder,
    } satisfies Prisma.CategoryOrderByWithRelationInput;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(CATEGORY_MESSAGES.NOT_FOUND);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    if (Object.keys(updateCategoryDto).length === 0) {
      throw new BadRequestException(CATEGORY_MESSAGES.EMPTY_UPDATE);
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.category.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(CATEGORY_MESSAGES.NAME_EXISTS);
      }

      if (error.code === 'P2003') {
        throw new ConflictException(CATEGORY_MESSAGES.HAS_TRANSACTIONS);
      }

      if (error.code === 'P2025') {
        throw new NotFoundException(CATEGORY_MESSAGES.NOT_FOUND);
      }
    }

    throw error;
  }
}
