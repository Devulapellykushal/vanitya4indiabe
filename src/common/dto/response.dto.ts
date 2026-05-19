import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNext: boolean;

  @ApiProperty()
  hasPrev: boolean;
}

export class PaginatedResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: PaginationMeta;

  @ApiProperty()
  timestamp: string;
}

