import dayjs from 'dayjs';
import { IUser } from 'app/shared/model/user.model';
import { IDepartment } from 'app/shared/model/department.model';

export interface IEmployee {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  hireDate?: dayjs.Dayjs;
  user?: IUser | null;
  department?: IDepartment | null;
}

export const defaultValue: Readonly<IEmployee> = {};
