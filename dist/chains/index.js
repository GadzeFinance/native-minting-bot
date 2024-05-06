"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performSlowSync = void 0;
const blast_1 = require("./slowsync/blast");
async function performSlowSync(chain) {
    if (chain.name === 'blast') {
        await (0, blast_1.blastSlowSync)();
    }
}
exports.performSlowSync = performSlowSync;
