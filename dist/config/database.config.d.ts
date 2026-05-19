export declare const databaseConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
    pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
    pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
    };
}>;
