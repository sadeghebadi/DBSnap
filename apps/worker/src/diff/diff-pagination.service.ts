import { DiffResult, DiffDetail } from './diff-result.interface.js';

export interface PaginatedDiff {
    data: DiffDetail[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export class DiffPaginationService {
    static paginate(result: DiffResult, page: number = 1, limit: number = 50): PaginatedDiff {
        const total = result.details.length;
        const pages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const end = start + limit;

        return {
            data: result.details.slice(start, end),
            total,
            page,
            limit,
            pages
        };
    }
}
