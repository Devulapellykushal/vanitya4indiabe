export declare class PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare class PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: PaginationMeta;
    timestamp: string;
}
