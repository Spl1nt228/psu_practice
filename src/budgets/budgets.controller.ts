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

import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { FindBudgetsQueryDto } from './dto/find-budgets-query.dto';
import { GetBudgetSummaryQueryDto } from './dto/get-budget-summary-query.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@ApiTags('budgets')
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create budget' })
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get budgets list' })
  findAll(@Query() query: FindBudgetsQueryDto) {
    return this.budgetsService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get budget summary for month' })
  getSummary(@Query() query: GetBudgetSummaryQueryDto) {
    return this.budgetsService.getSummary(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get budget by id' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update budget' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete budget' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.budgetsService.remove(id);
  }
}
