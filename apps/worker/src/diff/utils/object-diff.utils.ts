export interface FieldChange {
    path: string;
    before: any;
    after: any;
}

export function getObjectDiff(objA: any, objB: any, path: string = ''): FieldChange[] {
    const changes: FieldChange[] = [];

    const allKeys = new Set([...Object.keys(objA || {}), ...Object.keys(objB || {})]);

    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const valA = objA?.[key];
        const valB = objB?.[key];

        if (valA === valB) continue;

        if (typeof valA === 'object' && typeof valB === 'object' && valA !== null && valB !== null) {
            changes.push(...getObjectDiff(valA, valB, currentPath));
        } else {
            changes.push({
                path: currentPath,
                before: valA,
                after: valB
            });
        }
    }

    return changes;
}

export function areObjectsEqual(objA: any, objB: any): boolean {
    return JSON.stringify(objA) === JSON.stringify(objB);
}
