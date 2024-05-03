import { ChainInfo } from './config';
import { blastSlowSync } from './slowsync/blast';

export async function performSlowSync(chain: ChainInfo): Promise<void> {
    if (chain.name === 'blast') {
        await blastSlowSync();
    }
}

