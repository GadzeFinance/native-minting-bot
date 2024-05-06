import { ChainInfo } from './config';
import { blastSlowSync } from './slowsync/blast';
import { modeSlowSync } from './slowsync/mode';
import { baseSlowSync } from './slowsync/base';

export async function performSlowSync(chain: ChainInfo): Promise<void> {
    if (chain.name === 'blast') {
        await blastSlowSync(chain);
    } else if (chain.name === 'mode') {
        await modeSlowSync(chain);
    } else if (chain.name === 'base') {
        await baseSlowSync(chain);
    } else {
        throw new Error('Chain not supported');
    }
}

