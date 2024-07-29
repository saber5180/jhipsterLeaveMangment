import dayjs from 'dayjs';
import { IEmployee } from 'app/shared/model/employee.model';
import { LeaveStatus } from 'app/shared/model/enumerations/leave-status.model';

export interface ILeave {
  id?: number;
  title?: string;
  description?: string | null;
  fromDate?: dayjs.Dayjs;
  toDate?: dayjs.Dayjs;
  status?: keyof typeof LeaveStatus;
  employee?: IEmployee | null;
}

export const defaultValue: Readonly<ILeave> = {};
