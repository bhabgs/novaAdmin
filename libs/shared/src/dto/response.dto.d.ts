export declare class ApiResponse<T> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
}
export declare class PaginatedData<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
}
