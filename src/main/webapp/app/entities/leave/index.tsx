import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Leave from './leave';
import LeaveDetail from './leave-detail';
import LeaveUpdate from './leave-update';
import LeaveDeleteDialog from './leave-delete-dialog';

const LeaveRoutes = () => (
  <ErrorBoundaryRoutes>
    <Route index element={<Leave />} />
    <Route path="new" element={<LeaveUpdate />} />
    <Route path=":id">
      <Route index element={<LeaveDetail />} />
      <Route path="edit" element={<LeaveUpdate />} />
      <Route path="delete" element={<LeaveDeleteDialog />} />
    </Route>
  </ErrorBoundaryRoutes>
);

export default LeaveRoutes;
