import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class DTOEditGroup {
  @ApiModelPropertyOptional()
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiModelPropertyOptional()
  @IsArray()
  @IsOptional()
  readonly userIds?: string[];
}
