import { Module } from '@nestjs/common';
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { SummaryModule } from './summary/summary.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    PrismaModule,
    CategoriesModule,
    TransactionsModule,
    SummaryModule,
    BudgetsModule,
  ],
})
export class AppModule {}
