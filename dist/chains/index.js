"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSlowSync = void 0;
const blast_1 = require("./slowsync/blast");
const mode_1 = require("./slowsync/mode");
const base_1 = require("./slowsync/base");
async function performSlowSync(chain) {
    if (chain.name === 'blast') {
        await (0, blast_1.blastSlowSync)(chain);
    }
    else if (chain.name === 'mode') {
        await (0, mode_1.modeSlowSync)(chain);
    }
    else if (chain.name === 'base') {
        await (0, base_1.baseSlowSync)(chain);
    }
    else {
        throw new Error('Chain not supported');
    }
}
exports.performSlowSync = performSlowSync;
