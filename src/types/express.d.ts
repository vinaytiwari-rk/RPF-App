import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & Record<string, unknown> & { role?: string };
      authToken?: string;
    }
  }
}

export {};
