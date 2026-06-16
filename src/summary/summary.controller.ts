import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetSummaryQueryDto } from './dto/get-summary-query.dto';
import { SummaryService } from './summary.service';

@ApiTags('summary')
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @ApiOperation({ summary: 'Get income, expense and balance summary' })
  getSummary(@Query() query: GetSummaryQueryDto) {
    return this.summaryService.getSummary(query);
  }
}
