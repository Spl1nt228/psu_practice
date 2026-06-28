import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';

import { PRISMA_ERROR_CODES } from '../common/constants/prisma-error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { BUDGET_MESSAGES } from './budgets.constants';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { FindBudgetsQueryDto } from './dto/find-budgets-query.dto';
import { GetBudgetSummaryQueryDto } from './dto/get-budget-summary-query.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    await this.ensureCategoryExists(createBudgetDto.categoryId);

    try {
      return await this.prisma.budget.create({
        data: {
          categoryId: createBudgetDto.categoryId,
          limit: this.toDecimal(createBudgetDto.limit),
          year: createBudgetDto.year,
          month: createBudgetDto.month,
        },
        include: {
          category: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: FindBudgetsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.budget.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.budget.count({ where }),
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

  async getSummary(query: GetBudgetSummaryQueryDto) {
    const budgets = await this.prisma.budget.findMany({
      where: {
        year: query.year,
        month: query.month,
      },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          name: 'asc',
        },
      },
    });

    if (budgets.length === 0) {
      return [];
    }

    const categoryIds = budgets.map((budget) => budget.categoryId);
    const range = this.getMonthRange(query.year, query.month);
    const spentGroups = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        categoryId: {
          in: categoryIds,
        },
        type: TransactionType.expense,
        date: range,
      },
      _sum: {
        amount: true,
      },
    });
    const spentByCategory = new Map(
      spentGroups.map((item) => [
        item.categoryId,
        item._sum.amount ?? new Prisma.Decimal(0),
      ]),
    );

    return budgets.map((budget) => {
      const spent =
        spentByCategory.get(budget.categoryId) ?? new Prisma.Decimal(0);
      const remaining = budget.limit.minus(spent);
      const percentUsed = spent.isZero()
        ? 0
        : Math.round(spent.mul(100).div(budget.limit).toNumber());

      return {
        categoryId: budget.categoryId,
        categoryName: budget.category.name,
        limit: budget.limit,
        spent,
        remaining,
        percentUsed,
      };
    });
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!budget) {
      throw new NotFoundException(BUDGET_MESSAGES.NOT_FOUND);
    }

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    if (Object.keys(updateBudgetDto).length === 0) {
      throw new BadRequestException(BUDGET_MESSAGES.EMPTY_UPDATE);
    }

    if (updateBudgetDto.categoryId) {
      await this.ensureCategoryExists(updateBudgetDto.categoryId);
    }

    try {
      return await this.prisma.budget.update({
        where: { id },
        data: this.buildUpdateData(updateBudgetDto),
        include: {
          category: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.budget.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async getBudgetWarning(categoryId: string, date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const budget = await this.prisma.budget.findUnique({
      where: {
        categoryId_year_month: {
          categoryId,
          year,
          month,
        },
      },
    });

    if (!budget) {
      return;
    }

    const range = this.getMonthRange(year, month);
    const result = await this.prisma.transaction.aggregate({
      where: {
        categoryId,
        type: TransactionType.expense,
        date: range,
      },
      _sum: {
        amount: true,
      },
    });
    const spent = result._sum.amount ?? new Prisma.Decimal(0);

    if (spent.lte(budget.limit)) {
      return;
    }

    return {
      message: BUDGET_MESSAGES.LIMIT_EXCEEDED,
      limit: budget.limit,
      spent,
      overBy: spent.minus(budget.limit),
    };
  }

  private buildWhere(query: FindBudgetsQueryDto) {
    const where: Prisma.BudgetWhereInput = {};

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.year !== undefined) {
      where.year = query.year;
    }

    if (query.month !== undefined) {
      where.month = query.month;
    }

    return where;
  }

  private buildOrderBy(query: FindBudgetsQueryDto) {
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    return {
      [sortBy]: sortOrder,
    } satisfies Prisma.BudgetOrderByWithRelationInput;
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(BUDGET_MESSAGES.CATEGORY_NOT_FOUND);
    }
  }

  private buildUpdateData(updateBudgetDto: UpdateBudgetDto) {
    const data: Prisma.BudgetUncheckedUpdateInput = {};

    if (updateBudgetDto.categoryId !== undefined) {
      data.categoryId = updateBudgetDto.categoryId;
    }

    if (updateBudgetDto.limit !== undefined) {
      data.limit = this.toDecimal(updateBudgetDto.limit);
    }

    if (updateBudgetDto.year !== undefined) {
      data.year = updateBudgetDto.year;
    }

    if (updateBudgetDto.month !== undefined) {
      data.month = updateBudgetDto.month;
    }

    return data;
  }

  private getMonthRange(year: number, month: number) {
    return {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  private toDecimal(amount: number) {
    return new Prisma.Decimal(amount);
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_FAILED) {
        throw new ConflictException(BUDGET_MESSAGES.ALREADY_EXISTS);
      }

      if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        throw new NotFoundException(BUDGET_MESSAGES.NOT_FOUND);
      }
    }

    throw error;
  }
}
