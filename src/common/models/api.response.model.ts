import { ApiModelProperty } from '@nestjs/swagger';

export class ControllerResponse {
  @ApiModelProperty()
  public payload: any;
  @ApiModelProperty()
  public errorCode?: string;
  @ApiModelProperty()
  public errorMessage?: string;

  public Failed(code: string, message: string): ControllerResponse {
    this.errorCode = code;
    this.errorMessage = message;
    return this;
  }
}
