export enum ConversationMode {
    Casual = 'Casual',
    Story = 'Story',
    News = 'News',
    Education = 'Education',
    Motivation = 'Motivation',
}

export interface ElevenLabsVoice {
    voice_id: string;
    name: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: Array<{
        uri: string;
        title: string;
    }>
}

export type ConversationHistories = Record<ConversationMode, ChatMessage[]>;