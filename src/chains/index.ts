import { ChainInfo } from './config';
import { blastSlowSync } from './slowsync/blast';
import { modeSlowSync } from './slowsync/mode';
import { baseSlowSync } from './slowsync/base';



export async function performSlowSync(chain: ChainInfo): Promise<number> {
    if (chain.name === 'blast') {
        return await blastSlowSync(chain);
    } else if (chain.name === 'mode') {
        return await modeSlowSync(chain);
    } else if (chain.name === 'base') {
        return await baseSlowSync(chain);
    } else {
        throw new Error('Chain not supported');
    }
}

