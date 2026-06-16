import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TRANSACTION_MESSAGES } from './transactions.constants';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.ensureCategoryExists(createTransactionDto.categoryId);

    return this.prisma.transaction.create({
      data: {
        categoryId: createTransactionDto.categoryId,
        amount: this.toDecimal(createTransactionDto.amount),
        type: createTransactionDto.type,
        description: this.toDescription(createTransactionDto.description),
        date: this.toDate(createTransactionDto.date),
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(query: FindTransactionsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
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

  private buildWhere(query: FindTransactionsQueryDto) {
    const where: Prisma.TransactionWhereInput = {};
    const search = query.search?.trim();

    if (query.type) {
      where.type = query.type;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.dateFrom || query.dateTo) {
      const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
      const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

      if (dateFrom && dateTo && dateFrom > dateTo) {
        throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_DATE_RANGE);
      }

      where.date = {
        gte: dateFrom,
        lte: dateTo,
      };
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private buildOrderBy(query: FindTransactionsQueryDto) {
    const sortBy = query.sortBy ?? 'date';
    const sortOrder = query.sortOrder ?? 'desc';

    return {
      [sortBy]: sortOrder,
    } satisfies Prisma.TransactionOrderByWithRelationInput;
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(TRANSACTION_MESSAGES.NOT_FOUND);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    if (Object.keys(updateTransactionDto).length === 0) {
      throw new BadRequestException(TRANSACTION_MESSAGES.EMPTY_UPDATE);
    }

    if (updateTransactionDto.categoryId) {
      await this.ensureCategoryExists(updateTransactionDto.categoryId);
    }

    try {
      return await this.prisma.transaction.update({
        where: { id },
        data: this.buildUpdateData(updateTransactionDto),
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
      await this.prisma.transaction.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException(TRANSACTION_MESSAGES.CATEGORY_NOT_FOUND);
    }
  }

  private buildUpdateData(updateTransactionDto: UpdateTransactionDto) {
    const data: Prisma.TransactionUncheckedUpdateInput = {};

    if (updateTransactionDto.categoryId !== undefined) {
      data.categoryId = updateTransactionDto.categoryId;
    }

    if (updateTransactionDto.amount !== undefined) {
      data.amount = this.toDecimal(updateTransactionDto.amount);
    }

    if (updateTransactionDto.type !== undefined) {
      data.type = updateTransactionDto.type;
    }

    if (updateTransactionDto.description !== undefined) {
      data.description = this.toDescription(updateTransactionDto.description);
    }

    if (updateTransactionDto.date !== undefined) {
      data.date = this.toDate(updateTransactionDto.date);
    }

    return data;
  }

  private toDecimal(amount: string | number) {
    const amountAsString = String(amount);

    if (!/^\d+(\.\d{1,2})?$/.test(amountAsString)) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_AMOUNT);
    }

    const decimal = new Prisma.Decimal(amountAsString);

    if (decimal.lessThanOrEqualTo(0)) {
      throw new BadRequestException(TRANSACTION_MESSAGES.AMOUNT_NOT_POSITIVE);
    }

    return decimal;
  }

  private toDescription(description = '') {
    if (description.length > 255) {
      throw new BadRequestException(TRANSACTION_MESSAGES.DESCRIPTION_TOO_LONG);
    }

    return description;
  }

  private toDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_DATE);
    }

    if (parsedDate > new Date()) {
      throw new BadRequestException(TRANSACTION_MESSAGES.FUTURE_DATE);
    }

    return parsedDate;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException(TRANSACTION_MESSAGES.NOT_FOUND);
    }

    throw error;
  }
}
