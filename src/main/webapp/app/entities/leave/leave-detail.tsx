import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT, APP_LOCAL_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './leave.reducer';

export const LeaveDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, []);

  const leaveEntity = useAppSelector(state => state.leave.entity);
  return (
    <Row>
      <Col md="8">
        <h2 data-cy="leaveDetailsHeading">
          <Translate contentKey="leaveManagementv16App.leave.detail.title">Leave</Translate>
        </h2>
        <dl className="jh-entity-details">
          <dt>
            <span id="id">
              <Translate contentKey="global.field.id">ID</Translate>
            </span>
          </dt>
          <dd>{leaveEntity.id}</dd>
          <dt>
            <span id="title">
              <Translate contentKey="leaveManagementv16App.leave.title">Title</Translate>
            </span>
          </dt>
          <dd>{leaveEntity.title}</dd>
          <dt>
            <span id="description">
              <Translate contentKey="leaveManagementv16App.leave.description">Description</Translate>
            </span>
          </dt>
          <dd>{leaveEntity.description}</dd>
          <dt>
            <span id="fromDate">
              <Translate contentKey="leaveManagementv16App.leave.fromDate">From Date</Translate>
            </span>
          </dt>
          <dd>{leaveEntity.fromDate ? <TextFormat value={leaveEntity.fromDate} type="date" format={APP_LOCAL_DATE_FORMAT} /> : null}</dd>
          <dt>
            <span id="toDate">
              <Translate contentKey="leaveManagementv16App.leave.toDate">To Date</Translate>
            </span>
          </dt>
          <dd>{leaveEntity.toDate ? <TextFormat value={leaveEntity.toDate} type="date" format={APP_LOCAL_DATE_FORMAT} /> : null}</dd>
          <dt>
            <span id="status">
              <Translate contentKey="leaveManagementv16App.leave.status">Status</Translate>
            </span>
          </dt>
          <dd>{leaveEntity.status}</dd>
          <dt>
            <Translate contentKey="leaveManagementv16App.leave.employee">Employee</Translate>
          </dt>
          <dd>{leaveEntity.employee ? leaveEntity.employee.firstName : ''}</dd>
        </dl>
        <Button tag={Link} to="/leave" replace color="info" data-cy="entityDetailsBackButton">
          <FontAwesomeIcon icon="arrow-left" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.back">Back</Translate>
          </span>
        </Button>
        &nbsp;
        <Button tag={Link} to={`/leave/${leaveEntity.id}/edit`} replace color="primary">
          <FontAwesomeIcon icon="pencil-alt" />{' '}
          <span className="d-none d-md-inline">
            <Translate contentKey="entity.action.edit">Edit</Translate>
          </span>
        </Button>
      </Col>
    </Row>
  );
};

export default LeaveDetail;
