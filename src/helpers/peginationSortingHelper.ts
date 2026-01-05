type IOptions = {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
type IOptionsResult = {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    skip: number;
    take: number;
    orderBy: Record<string, "asc" | "desc">
}
const peginationSortingHelper = (options: IOptions): IOptionsResult => {
    const page = Number(options.page || 1);
    const limit = Number(options.limit || 10);
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";
    return {
        page,
        limit,
        sortBy,
        sortOrder,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    };
}

export default peginationSortingHelper