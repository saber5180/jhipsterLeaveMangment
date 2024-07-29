import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { isNumber, Translate, translate, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { convertDateTimeFromServer, convertDateTimeToServer, displayDefaultDateTime } from 'app/shared/util/date-utils';
import { mapIdList } from 'app/shared/util/entity-utils';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { IEmployee } from 'app/shared/model/employee.model';
import { getEntities as getEmployees } from 'app/entities/employee/employee.reducer';
import { ILeave } from 'app/shared/model/leave.model';
import { LeaveStatus } from 'app/shared/model/enumerations/leave-status.model';
import { getEntity, updateEntity, createEntity, reset } from './leave.reducer';

export const LeaveUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const employees = useAppSelector(state => state.employee.entities);
  const leaveEntity = useAppSelector(state => state.leave.entity);
  const loading = useAppSelector(state => state.leave.loading);
  const updating = useAppSelector(state => state.leave.updating);
  const updateSuccess = useAppSelector(state => state.leave.updateSuccess);
  const leaveStatusValues = Object.keys(LeaveStatus);

  const handleClose = () => {
    navigate('/leave' + location.search);
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }

    dispatch(getEmployees({}));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  // eslint-disable-next-line complexity
  const saveEntity = values => {
    if (values.id !== undefined && typeof values.id !== 'number') {
      values.id = Number(values.id);
    }

    const entity = {
      ...leaveEntity,
      ...values,
      employee: employees.find(it => it.id.toString() === values.employee?.toString()),
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {}
      : {
          status: 'REQUESTED',
          ...leaveEntity,
          employee: leaveEntity?.employee?.id,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="leaveManagementv16App.leave.home.createOrEditLabel" data-cy="LeaveCreateUpdateHeading">
            <Translate contentKey="leaveManagementv16App.leave.home.createOrEditLabel">Create or edit a Leave</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              {!isNew ? (
                <ValidatedField
                  name="id"
                  required
                  readOnly
                  id="leave-id"
                  label={translate('global.field.id')}
                  validate={{ required: true }}
                />
              ) : null}
              <ValidatedField
                label={translate('leaveManagementv16App.leave.title')}
                id="leave-title"
                name="title"
                data-cy="title"
                type="text"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                }}
              />
              <ValidatedField
                label={translate('leaveManagementv16App.leave.description')}
                id="leave-description"
                name="description"
                data-cy="description"
                type="text"
              />
              <ValidatedField
                label={translate('leaveManagementv16App.leave.fromDate')}
                id="leave-fromDate"
                name="fromDate"
                data-cy="fromDate"
                type="date"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                }}
              />
              <ValidatedField
                label={translate('leaveManagementv16App.leave.toDate')}
                id="leave-toDate"
                name="toDate"
                data-cy="toDate"
                type="date"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                }}
              />
              <ValidatedField
                label={translate('leaveManagementv16App.leave.status')}
                id="leave-status"
                name="status"
                data-cy="status"
                type="select"
              >
                {leaveStatusValues.map(leaveStatus => (
                  <option value={leaveStatus} key={leaveStatus}>
                    {translate('leaveManagementv16App.LeaveStatus.' + leaveStatus)}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                id="leave-employee"
                name="employee"
                data-cy="employee"
                label={translate('leaveManagementv16App.leave.employee')}
                type="select"
              >
                <option value="" key="0" />
                {employees
                  ? employees.map(otherEntity => (
                      <option value={otherEntity.id} key={otherEntity.id}>
                        {otherEntity.firstName}
                      </option>
                    ))
                  : null}
              </ValidatedField>
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/leave" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.back">Back</Translate>
                </span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp;
                <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default LeaveUpdate;
