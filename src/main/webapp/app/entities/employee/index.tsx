import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Employee from './employee';
import EmployeeDetail from './employee-detail';
import EmployeeUpdate from './employee-update';
import EmployeeDeleteDialog from './employee-delete-dialog';
import UserEmployeeForm from './employee-New';

const EmployeeRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Employee />} />
    <Route path="new" element={<UserEmployeeForm />} />
    <Route path=":id">
      <Route index element={<EmployeeDetail />} />
      <Route path="edit" element={<EmployeeUpdate />} />
      <Route path="delete" element={<EmployeeDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default EmployeeRoutes;
