import { getConfig } from '@dbsnap/shared';

const config = getConfig();
console.log(`DBSnap Worker starting with ${config.APP_NAME} config on port ${config.WORKER_PORT}...`);
