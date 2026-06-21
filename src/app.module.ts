import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { SummaryModule } from './summary/summary.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [PrismaModule, CategoriesModule, TransactionsModule, SummaryModule],
})
export class AppModule {}
