export interface PromptBody {
    data: PromptData;
}

export interface PromptData {
    userId: string;
}

export interface PromptByStringBody {
    userId: string;
    prompt: string;
}
