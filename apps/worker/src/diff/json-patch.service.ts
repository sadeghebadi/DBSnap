import { getObjectDiff, FieldChange } from './utils/object-diff.utils.js';

export interface VisualDelta {
    added: string[];
    removed: string[];
    changed: FieldChange[];
}

export class JsonPatchService {
    static getVisualDelta(before: any, after: any): VisualDelta {
        const changes = getObjectDiff(before, after);

        const added = changes.filter(c => c.before === undefined).map(c => c.path);
        const removed = changes.filter(c => c.after === undefined).map(c => c.path);
        const modified = changes.filter(c => c.before !== undefined && c.after !== undefined);

        return {
            added,
            removed,
            changed: modified
        };
    }
}
