import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
declare const logger: winston.Logger;
declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}
export declare const requestLogging: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorLogging: (err: Error, req: Request, _res: Response, next: NextFunction) => void;
export { logger };
//# sourceMappingURL=logging.d.ts.map