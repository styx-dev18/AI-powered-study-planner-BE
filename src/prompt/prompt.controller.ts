import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptBody } from './dto/prompt.dto';

@Controller('prompt')
export class PromptController {
    constructor(private readonly promptService: PromptService) { }
    @HttpCode(HttpStatus.OK)
    @Post()
    async getPromptResponse(@Body() body: PromptBody) {
        return await this.promptService.getPromptResponse(body.data.userId);
    }
}
