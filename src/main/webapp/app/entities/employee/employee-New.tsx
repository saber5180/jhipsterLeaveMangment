import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import { Translate, translate } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { createEntity as createEmployee } from './employee.reducer';
import { createUser } from 'app/modules/administration/user-management/user-management.reducer';
import { getEntities as getDepartments } from '../department/department.reducer';
import dayjs from 'dayjs';
import { IUser } from 'app/shared/model/user.model';
import { defaultValue as defaultUser } from 'app/shared/model/user.model';
import { IDepartment } from 'app/shared/model/department.model';

interface UserActionResult {
  payload: IUser;
}

const UserEmployeeForm = () => {
  const dispatch = useAppDispatch();

  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hireDate: dayjs(),
    department: null as IDepartment | null,
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const departments = useAppSelector(state => state.department.entities);
  const loading = useAppSelector(state => state.userManagement.loading || state.employee.loading);

  const [userData, setUserData] = useState<IUser>({
    ...defaultUser,
    activated: true,
    langKey: 'en',
    authorities: ['ROLE_USER'],
  });

  useEffect(() => {
    dispatch(getDepartments({}));
  }, [dispatch]);

  const handleUserChange = event => {
    const { name, value } = event.target;
    setUserData(prevState => ({ ...prevState, [name]: value }));
    if (name === 'firstName' || name === 'lastName' || name === 'email') {
      setEmployeeData(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleEmployeeChange = event => {
    const { name, value } = event.target;
    if (name === 'hireDate') {
      setEmployeeData(prevState => ({ ...prevState, hireDate: dayjs(value) }));
    } else if (name === 'department') {
      const selectedDepartment = departments.find(dept => dept.id.toString() === value);
      setEmployeeData(prevState => ({ ...prevState, department: selectedDepartment || null }));
    } else {
      setEmployeeData(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const handleRoleChange = event => {
    const { value, checked } = event.target;
    const newAuthorities = checked ? [...userData.authorities, value] : userData.authorities.filter(authority => authority !== value);
    setUserData(prevState => ({ ...prevState, authorities: newAuthorities }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result) {
          setImagePreview(result);
          // Instead of setting imageUrl directly, we'll store the file itself
          setUserData(prevState => ({
            ...prevState,
            // Store the file object instead of the data URL
            imageUrl: file,
          }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setUserData(prevState => ({
        ...prevState,
        imageUrl: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(false);
    setError('');

    if (!employeeData.department) {
      setError('Department is required');
      return;
    }

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'imageUrl' && userData[key] instanceof File) {
          formData.append('file', userData[key] as File);
        } else {
          formData.append(key, userData[key] as string);
        }
      });

      // Dispatch the createUser action with FormData
      const resultAction = (await dispatch(createUser(userData))) as UserActionResult;
      const user = resultAction.payload;

      if (user && user.id) {
        await dispatch(
          createEmployee({
            ...employeeData,
            hireDate: employeeData.hireDate,
            user: { id: user.id },
            department: employeeData.department,
          }),
        );
        setSuccess(true);
        resetForm();
      } else {
        throw new Error('User creation failed: No valid user data returned');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError('Error creating user and employee: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const resetForm = () => {
    setUserData({
      ...defaultUser,
      activated: true,
      langKey: 'en',
      authorities: ['ROLE_USER'],
    });
    setEmployeeData({
      firstName: '',
      lastName: '',
      email: '',
      hireDate: dayjs(),
      department: null,
    });
    setSelectedFile(null);
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
              <Label for="imageUpload">
                <Translate contentKey="userManagement.imageUpload">Upload Image</Translate>
              </Label>
              <Input id="imageUpload" name="imageUpload" type="file" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="User avatar preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                </div>
              )}
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
              <Input
                id="hireDate"
                name="hireDate"
                type="date"
                value={employeeData.hireDate.format('YYYY-MM-DD')}
                onChange={handleEmployeeChange}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label for="department">
                <Translate contentKey="employee.department">Department</Translate>
              </Label>
              <Input
                id="department"
                name="department"
                type="select"
                value={employeeData.department ? employeeData.department.id : ''}
                onChange={handleEmployeeChange}
                required
              >
                <option value="">{translate('userEmployeeForm.selectDepartment')}</option>
                {departments && departments.length > 0 ? (
                  departments.map((department: IDepartment) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No departments available
                  </option>
                )}
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
