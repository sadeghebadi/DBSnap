import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
    traceId: string;
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const runWithContext = <T>(context: RequestContext, callback: () => T): T => {
    return asyncLocalStorage.run(context, callback);
};

export const getContext = (): RequestContext | undefined => {
    return asyncLocalStorage.getStore();
};

export const getTraceId = (): string | undefined => {
    const context = getContext();
    return context?.traceId;
};
