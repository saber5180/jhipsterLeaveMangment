import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Leave e2e test', () => {
  const leavePageUrl = '/leave';
  const leavePageUrlPattern = new RegExp('/leave(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const leaveSample = { title: 'of', fromDate: '2024-07-28', toDate: '2024-07-29', status: 'REQUESTED' };

  let leave;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/leaves+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/leaves').as('postEntityRequest');
    cy.intercept('DELETE', '/api/leaves/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (leave) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/leaves/${leave.id}`,
      }).then(() => {
        leave = undefined;
      });
    }
  });

  it('Leaves menu should load Leaves page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('leave');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Leave').should('exist');
    cy.url().should('match', leavePageUrlPattern);
  });

  describe('Leave page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(leavePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Leave page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/leave/new$'));
        cy.getEntityCreateUpdateHeading('Leave');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leavePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/leaves',
          body: leaveSample,
        }).then(({ body }) => {
          leave = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/leaves+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/leaves?page=0&size=20>; rel="last",<http://localhost/api/leaves?page=0&size=20>; rel="first"',
              },
              body: [leave],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(leavePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Leave page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('leave');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leavePageUrlPattern);
      });

      it('edit button click should load edit Leave page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Leave');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leavePageUrlPattern);
      });

      it('edit button click should load edit Leave page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Leave');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leavePageUrlPattern);
      });

      it('last delete button click should delete instance of Leave', () => {
        cy.intercept('GET', '/api/leaves/*').as('dialogDeleteRequest');
        cy.get(entityDeleteButtonSelector).last().click();
        cy.wait('@dialogDeleteRequest');
        cy.getEntityDeleteDialogHeading('leave').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leavePageUrlPattern);

        leave = undefined;
      });
    });
  });

  describe('new Leave page', () => {
    beforeEach(() => {
      cy.visit(`${leavePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Leave');
    });

    it('should create an instance of Leave', () => {
      cy.get(`[data-cy="title"]`).type('opposite insidious');
      cy.get(`[data-cy="title"]`).should('have.value', 'opposite insidious');

      cy.get(`[data-cy="description"]`).type('kindhearted haunting');
      cy.get(`[data-cy="description"]`).should('have.value', 'kindhearted haunting');

      cy.get(`[data-cy="fromDate"]`).type('2024-07-29');
      cy.get(`[data-cy="fromDate"]`).blur();
      cy.get(`[data-cy="fromDate"]`).should('have.value', '2024-07-29');

      cy.get(`[data-cy="toDate"]`).type('2024-07-29');
      cy.get(`[data-cy="toDate"]`).blur();
      cy.get(`[data-cy="toDate"]`).should('have.value', '2024-07-29');

      cy.get(`[data-cy="status"]`).select('REQUESTED');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        leave = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', leavePageUrlPattern);
    });
  });
});
