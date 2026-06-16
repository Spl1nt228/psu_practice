import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { GetSummaryQueryDto } from './dto/get-summary-query.dto';
import { SUMMARY_MESSAGES } from './summary.constants';

@Injectable()
export class SummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: GetSummaryQueryDto) {
    const dateRange = this.getDateRange(query);

    const [income, expense] = await Promise.all([
      this.sumByType(TransactionType.income, dateRange),
      this.sumByType(TransactionType.expense, dateRange),
    ]);

    const balance = income.minus(expense);

    return {
      totalIncome: income.toFixed(2),
      totalExpense: expense.toFixed(2),
      balance: balance.toFixed(2),
      period: {
        dateFrom: dateRange.gte.toISOString(),
        dateTo: dateRange.lte.toISOString(),
      },
    };
  }

  private getDateRange(query: GetSummaryQueryDto) {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new BadRequestException(SUMMARY_MESSAGES.INVALID_DATE_RANGE);
    }

    if (dateFrom || dateTo) {
      return {
        gte: dateFrom ?? new Date(0),
        lte: dateTo ?? new Date(),
      };
    }

    return this.getCurrentMonthRange();
  }

  private getCurrentMonthRange() {
    const now = new Date();
    const dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const dateTo = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return {
      gte: dateFrom,
      lte: dateTo,
    };
  }

  private async sumByType(
    type: TransactionType,
    dateRange: Prisma.DateTimeFilter<'Transaction'>,
  ) {
    const result = await this.prisma.transaction.aggregate({
      where: {
        type,
        date: dateRange,
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount ?? new Prisma.Decimal(0);
  }
}
