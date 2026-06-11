import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.ensureCategoryExists(createTransactionDto.categoryId);

    return this.prisma.transaction.create({
      data: {
        categoryId: createTransactionDto.categoryId,
        amount: this.toDecimal(createTransactionDto.amount),
        type: this.toTransactionType(createTransactionDto.type),
        description: this.toDescription(createTransactionDto.description),
        date: this.toDate(createTransactionDto.date),
      },
      include: {
        category: true,
      },
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
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
      throw new NotFoundException('Category not found');
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
      data.type = this.toTransactionType(updateTransactionDto.type);
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
      throw new BadRequestException('Amount must be a valid number');
    }

    const decimal = new Prisma.Decimal(amountAsString);

    if (decimal.lessThanOrEqualTo(0)) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    return decimal;
  }

  private toTransactionType(type: string) {
    if (type !== TransactionType.expense && type !== TransactionType.income) {
      throw new BadRequestException('Type must be expense or income');
    }

    return type;
  }

  private toDescription(description = '') {
    if (description.length > 255) {
      throw new BadRequestException('Description must be 255 characters or less');
    }

    return description;
  }

  private toDate(date: string) {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Date must be a valid date');
    }

    if (parsedDate > new Date()) {
      throw new BadRequestException('Date must not be in the future');
    }

    return parsedDate;
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Transaction not found');
    }

    throw error;
  }
}
