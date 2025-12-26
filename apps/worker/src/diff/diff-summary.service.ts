import { DiffResult } from './diff-result.interface.js';

export class DiffSummaryService {
    static generateTextSummary(result: DiffResult): string {
        const lines: string[] = [];
        lines.push(`DBSnap Diff Summary - ${new Date(result.timestamp).toLocaleString()}`);
        lines.push(`Comparing: ${result.snapshotA} vs ${result.snapshotB}`);
        lines.push('--------------------------------------------------');
        lines.push(`Total Changes:`);
        lines.push(`  - Added:    ${result.summary.totalAdded}`);
        lines.push(`  - Removed:  ${result.summary.totalRemoved}`);
        lines.push(`  - Modified: ${result.summary.totalModified}`);
        lines.push('');

        if (result.tables.length > 0) {
            lines.push('Changes by Table/Collection:');
            for (const table of result.tables) {
                const parts: string[] = [];
                if (table.added > 0) parts.push(`+${table.added} added`);
                if (table.removed > 0) parts.push(`-${table.removed} removed`);
                if (table.modified > 0) parts.push(`~${table.modified} modified`);
                lines.push(`  - ${table.tableName}: ${parts.join(', ')}`);
            }
        } else {
            lines.push('No changes detected.');
        }

        return lines.join('\n');
    }
}
