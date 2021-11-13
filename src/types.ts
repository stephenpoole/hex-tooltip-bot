/* eslint-disable no-undef */
import tmi from "tmi.js";
import { ChatType } from "./enum";

interface BotClients {
    main: tmi.Client;
    group: tmi.Client;
}

interface UserState {
    username: string;
    messageType: ChatType;
    mod: boolean;
}

interface AppState {
    [key: string]: unknown;
    block: string[];
    joined: string[];
}

export { BotClients, UserState, AppState };
