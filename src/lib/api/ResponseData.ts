export interface ResponseData<T> {
    data?: T;
    success: boolean,
    error?: string
}