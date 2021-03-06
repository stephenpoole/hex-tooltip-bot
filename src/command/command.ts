import { BotErrorMessage, ChatType } from "../enum";
import BotError from "../error";
import Limiter from "../limiter";
import State from "../state";
import { BotClients, UserState } from "../types";

class Command {
    clients: BotClients;
    name: string;
    chatTypes: ChatType[] = [];
    bound: ChatType[] = [];
    triggers: string[] = [];
    limiter: Limiter = new Limiter(5000);
    helpText: string;
    state: State;

    constructor(
        clients: BotClients,
        name = "Command",
        triggers: string[] = [],
        chatTypes: ChatType[] = [ChatType.Command],
        state: State
    ) {
        this.clients = clients;
        this.triggers = triggers;
        this.name = name;
        this.chatTypes = chatTypes;
        this.state = state;
        this.bound = [];

        if (typeof this.triggers === "string") {
            this.triggers = [this.triggers];
        }
        if (typeof this.chatTypes === "string") {
            this.chatTypes = [this.chatTypes];
        }

        this.chatTypes.forEach(chatType => {
            if (chatType === ChatType.Command) {
                this.bind(ChatType.Chat);
            } else {
                this.bind(chatType);
            }

            this.bound.push(chatType);
        });
    }

    protected bind(chatType: ChatType): void {
        if (this.bound.indexOf(chatType) === -1) {
            this.clients.main.on(chatType, this.trigger.bind(this));
        }
    }

    protected params(message: string): string[] {
        return message.split(" ").slice(1);
    }

    protected trigger(channel: string, userstate: UserState, message: string, self: unknown): void {
        if (self) {
            return;
        }

        const command = message.substring(0, message.indexOf(" ")) || message;
        let shouldExecute = false;

        if (this.triggers.indexOf(command) > -1) {
            shouldExecute = true;
        } else {
            return;
        }

        const limiterKey = `${channel}.${userstate.username}`;
        const isLimited = this.limiter.get(limiterKey);

        if (isLimited) {
            return;
        }

        if (!userstate.mod) {
            this.limiter.set(limiterKey);
        }

        const params = this.params(message);

        if (shouldExecute) {
            this.execute(channel, userstate, params);
        }
    }

    protected execute(channel: string, userstate: UserState, params: string[]): void {
        this.respond(
            channel,
            userstate,
            `${this.name} command triggered via ${userstate["message-type"]} by ${userstate.username} with params [${params}].`
        );
    }

    error(channel: string, userstate: UserState, error?: BotError, context = ""): void {
        this.respond(
            channel,
            userstate,
            `@${userstate.username} ${error?.message || BotErrorMessage.Generic} ${context}`
        );
    }

    respond(channel: string, userstate: UserState, message: string): void {
        switch (userstate["message-type"]) {
            case ChatType.Whisper:
                this.clients.group.whisper(channel, message);
                break;
            case ChatType.Action:
            case ChatType.Chat:
                this.clients.main.say(channel, message);
                break;
            default:
                break;
        }
    }
}

export default Command;
