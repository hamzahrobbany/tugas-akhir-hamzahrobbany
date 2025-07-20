import { Role } from '@prisma/client';

export interface AuthToken {
  id: string;
  email: string;
  name?: string;
  role: Role;
  isVerifiedByAdmin: boolean;
}
