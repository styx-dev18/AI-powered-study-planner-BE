import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddFocusedTimeDto {
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  timeInSeconds: number;
}
