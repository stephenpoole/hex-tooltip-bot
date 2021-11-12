import Dbd, { DbdUtil } from "../dbd";
import { BotErrorMessage, ChatType } from "../enum";
import BotError from "../error";
import { BotClients, UserState } from "../types";
import Command from "./command";

class GetCommand extends Command {
    constructor(clients: BotClients) {
        super(clients, "get", ["!get"], [ChatType.Command, ChatType.Whisper]);
    }

    execute(channel: string, userstate: UserState, params: string[] = []): void {
        const name = params.join(" ");
        const model = name.length === 0 ? Dbd.random([], []) : Dbd.get(name);

        if (!model || model.isEmpty) {
            this.error(channel, userstate, new BotError(BotErrorMessage.ModelNotFound, "get"));
        } else {
            this.respond(channel, userstate, `${DbdUtil.stringify(model)} @${userstate.username}`);
        }
    }
}

export default GetCommand;