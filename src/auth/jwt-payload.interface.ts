import { Role } from '../users/users.entity';

export interface IPayload {
  sub: number;
  email: string;
  role: Role;
}
