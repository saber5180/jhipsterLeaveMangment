import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Leave from './leave';
import Department from './department';
import Employee from './employee';
import RegisterPage from 'app/modules/account/register/register';
/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="leave/*" element={<Leave />} />
        <Route path="department/*" element={<Department />} />
        <Route path="employee/*" element={<Employee />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
