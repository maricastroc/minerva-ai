import { AccountProps } from './account';
import { SessionProps } from './session';

export interface UserProps {
  id: string | number;
  name: string;
  avatarUrl?: string | null | undefined;
  createdAt?: string;
  password?: string | null;
  email?: string;
  provider?: string;

  accounts?: AccountProps[] | null | undefined;
  sessions?: SessionProps[] | null | undefined;
}
