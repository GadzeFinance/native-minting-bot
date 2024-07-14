import { ChainInfo } from './config';
import { blastSlowSync } from './slowsync/blast';
import { modeSlowSync } from './slowsync/mode';
import { baseSlowSync } from './slowsync/base';
import { lineaSlowSync } from './slowsync/linea';
import { BigNumber } from 'ethers';

// all chain slow syncs should return the total wei in the bridge and a formatted discord 
// report string of all the current withdraws from this chain
export interface SlowSyncResult {
    totalWei: BigNumber,
    discordReport: string 
}

export async function performSlowSync(chain: ChainInfo): Promise<SlowSyncResult> {
    if (chain.name === 'linea') {
        return await lineaSlowSync(chain);
    } else if (chain.name === 'blast') {
        return await blastSlowSync(chain);
    } else if (chain.name === 'mode') {
        return await modeSlowSync(chain);
    } else if (chain.name === 'base') {
        return await baseSlowSync(chain);
    } else {
        throw new Error('Chain not supported');
    }
}

