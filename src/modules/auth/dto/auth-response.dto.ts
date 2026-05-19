import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  user: Partial<User>;

  @ApiProperty()
  token: string;
}

