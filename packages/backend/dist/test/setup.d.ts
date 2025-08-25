declare const mockPrisma: import(".prisma/client").PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function setupTestDatabase(): Promise<void>;
export declare function teardownTestDatabase(): Promise<void>;
export { mockPrisma };
//# sourceMappingURL=setup.d.ts.map