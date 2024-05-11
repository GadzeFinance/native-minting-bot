"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSlowSync = void 0;
const blast_1 = require("./slowsync/blast");
const mode_1 = require("./slowsync/mode");
const base_1 = require("./slowsync/base");
const linea_1 = require("./slowsync/linea");
async function performSlowSync(chain) {
    if (chain.name === 'linea') {
        return await (0, linea_1.lineaSlowSync)(chain);
    }
    else if (chain.name === 'blast') {
        return await (0, blast_1.blastSlowSync)(chain);
    }
    else if (chain.name === 'mode') {
        return await (0, mode_1.modeSlowSync)(chain);
    }
    else if (chain.name === 'base') {
        return await (0, base_1.baseSlowSync)(chain);
    }
    else {
        throw new Error('Chain not supported');
    }
}
exports.performSlowSync = performSlowSync;
