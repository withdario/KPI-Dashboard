interface BusinessEntityData {
    name: string;
    description?: string;
    domain?: string;
}
interface BusinessEntityResponse {
    success: boolean;
    message: string;
    businessEntity?: any;
    businessEntities?: any[];
}
export declare class BusinessEntityService {
    createBusinessEntity(data: BusinessEntityData): Promise<BusinessEntityResponse>;
    getBusinessEntity(id: string): Promise<BusinessEntityResponse>;
    getAllBusinessEntities(): Promise<BusinessEntityResponse>;
    updateBusinessEntity(id: string, data: Partial<BusinessEntityData>): Promise<BusinessEntityResponse>;
    deleteBusinessEntity(id: string): Promise<BusinessEntityResponse>;
    deactivateBusinessEntity(id: string): Promise<BusinessEntityResponse>;
    activateBusinessEntity(id: string): Promise<BusinessEntityResponse>;
    getBusinessEntityStats(id: string): Promise<BusinessEntityResponse>;
}
export {};
//# sourceMappingURL=businessEntityService.d.ts.map