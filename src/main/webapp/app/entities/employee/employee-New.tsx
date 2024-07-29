import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { createEntity } from './employee.reducer';
import { createUser } from 'app/modules/administration/user-management/user-management.reducer';
import { getEntities } from '../department/department.reducer';
import dayjs from 'dayjs';

interface UserActionResult {
  payload: {
    id: number | string;
    login: string;
    email: string;
    firstName: string;
    lastName: string;
    activated: boolean;
    langKey: string;
    authorities: string[];
  };
}

const UserEmployeeForm = () => {
  const dispatch = useAppDispatch();

  const [userData, setUserData] = useState({
    login: '',
    email: '',
    firstName: '',
    lastName: '',
    activated: true,
    langKey: 'en',
    authorities: ['ROLE_USER'],
  });

  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hireDate: '',
    departmentId: '',
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const departments = useAppSelector(state => state.department.entities);
  const loading = useAppSelector(state => state.userManagement.loading || state.employee.loading);

  useEffect(() => {
    dispatch(getEntities({}));
  }, [dispatch]);

  const handleUserChange = event => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
    if (name === 'firstName' || name === 'lastName' || name === 'email') {
      setEmployeeData({ ...employeeData, [name]: value });
    }
  };

  const handleEmployeeChange = event => {
    const { name, value } = event.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  const handleRoleChange = event => {
    const { value, checked } = event.target;
    const newAuthorities = checked ? [...userData.authorities, value] : userData.authorities.filter(authority => authority !== value);
    setUserData({ ...userData, authorities: newAuthorities });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSuccess(false);
    setError('');

    try {
      const resultAction = (await dispatch(createUser(userData))) as UserActionResult;
      const user = resultAction.payload;

      if (user && user.id) {
        await dispatch(
          createEntity({
            ...employeeData,
            hireDate: dayjs(employeeData.hireDate),
            user: { id: user.id },
          }),
        );
        setSuccess(true);
        setUserData({
          login: '',
          email: '',
          firstName: '',
          lastName: '',
          activated: true,
          langKey: 'en',
          authorities: ['ROLE_USER'],
        });
        setEmployeeData({
          firstName: '',
          lastName: '',
          email: '',
          hireDate: '',
          departmentId: '',
        });
      } else {
        throw new Error('User creation failed: No valid user data returned');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError('Error creating user and employee: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="userEmployeeForm.title">
            <Translate contentKey="userEmployeeForm.title">Create a User and Employee</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading && <p>Loading...</p>}
          {success && (
            <div className="alert alert-success">
              <Translate contentKey="userEmployeeForm.messages.success">User and Employee created successfully!</Translate>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label for="login">
                <Translate contentKey="userManagement.login">Login</Translate>
              </Label>
              <Input id="login" name="login" value={userData.login} onChange={handleUserChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="email">
                <Translate contentKey="userManagement.email">Email</Translate>
              </Label>
              <Input id="email" name="email" type="email" value={userData.email} onChange={handleUserChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="firstName">
                <Translate contentKey="userManagement.firstName">First Name</Translate>
              </Label>
              <Input id="firstName" name="firstName" value={userData.firstName} onChange={handleUserChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="lastName">
                <Translate contentKey="userManagement.lastName">Last Name</Translate>
              </Label>
              <Input id="lastName" name="lastName" value={userData.lastName} onChange={handleUserChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="langKey">
                <Translate contentKey="userManagement.langKey">Language Key</Translate>
              </Label>
              <Input id="langKey" name="langKey" type="select" value={userData.langKey} onChange={handleUserChange} required>
                <option value="en">English</option>
                <option value="fr">French</option>
                {/* Add other languages as needed */}
              </Input>
            </FormGroup>
            <FormGroup>
              <div>
                <Input type="hidden" value="ROLE_USER" checked={userData.authorities.includes('ROLE_USER')} onChange={handleRoleChange} />
              </div>

              {/* Add other roles as needed */}
            </FormGroup>
            <FormGroup>
              <Label for="hireDate">
                <Translate contentKey="employee.hireDate">Hire Date</Translate>
              </Label>
              <Input id="hireDate" name="hireDate" type="date" value={employeeData.hireDate} onChange={handleEmployeeChange} required />
            </FormGroup>
            <FormGroup>
              <Label for="departmentId">
                <Translate contentKey="employee.department">Department</Translate>
              </Label>
              <Input
                id="departmentId"
                name="departmentId"
                type="select"
                value={employeeData.departmentId}
                onChange={handleEmployeeChange}
                required
              >
                <option value="">{translate('userEmployeeForm.selectDepartment')}</option>
                {departments.map(department => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <Button color="primary" type="submit" disabled={loading}>
              <FontAwesomeIcon icon="save" />
              &nbsp;
              <Translate contentKey="entity.action.save">Save</Translate>
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default UserEmployeeForm;
