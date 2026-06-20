import { Role } from './users.entity';

export interface IPayload {
  sub: number;
  email: string;
  role: Role;
}
