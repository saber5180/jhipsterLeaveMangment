package com.mycompany.myapp.web.rest;

import static com.mycompany.myapp.domain.LeaveAsserts.*;
import static com.mycompany.myapp.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Leave;
import com.mycompany.myapp.domain.enumeration.LeaveStatus;
import com.mycompany.myapp.repository.LeaveRepository;
import com.mycompany.myapp.service.LeaveService;
import com.mycompany.myapp.service.dto.LeaveDTO;
import com.mycompany.myapp.service.mapper.LeaveMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link LeaveResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class LeaveResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_FROM_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_FROM_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_TO_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_TO_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LeaveStatus DEFAULT_STATUS = LeaveStatus.REQUESTED;
    private static final LeaveStatus UPDATED_STATUS = LeaveStatus.REJECTED;

    private static final String ENTITY_API_URL = "/api/leaves";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private LeaveRepository leaveRepository;

    @Mock
    private LeaveRepository leaveRepositoryMock;

    @Autowired
    private LeaveMapper leaveMapper;

    @Mock
    private LeaveService leaveServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLeaveMockMvc;

    private Leave leave;

    private Leave insertedLeave;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Leave createEntity(EntityManager em) {
        Leave leave = new Leave()
            .title(DEFAULT_TITLE)
            .description(DEFAULT_DESCRIPTION)
            .fromDate(DEFAULT_FROM_DATE)
            .toDate(DEFAULT_TO_DATE)
            .status(DEFAULT_STATUS);
        return leave;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Leave createUpdatedEntity(EntityManager em) {
        Leave leave = new Leave()
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fromDate(UPDATED_FROM_DATE)
            .toDate(UPDATED_TO_DATE)
            .status(UPDATED_STATUS);
        return leave;
    }

    @BeforeEach
    public void initTest() {
        leave = createEntity(em);
    }

    @AfterEach
    public void cleanup() {
        if (insertedLeave != null) {
            leaveRepository.delete(insertedLeave);
            insertedLeave = null;
        }
    }

    @Test
    @Transactional
    void createLeave() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);
        var returnedLeaveDTO = om.readValue(
            restLeaveMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            LeaveDTO.class
        );

        // Validate the Leave in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedLeave = leaveMapper.toEntity(returnedLeaveDTO);
        assertLeaveUpdatableFieldsEquals(returnedLeave, getPersistedLeave(returnedLeave));

        insertedLeave = returnedLeave;
    }

    @Test
    @Transactional
    void createLeaveWithExistingId() throws Exception {
        // Create the Leave with an existing ID
        leave.setId(1L);
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restLeaveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leave.setTitle(null);

        // Create the Leave, which fails.
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        restLeaveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFromDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leave.setFromDate(null);

        // Create the Leave, which fails.
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        restLeaveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkToDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leave.setToDate(null);

        // Create the Leave, which fails.
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        restLeaveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leave.setStatus(null);

        // Create the Leave, which fails.
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        restLeaveMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllLeaves() throws Exception {
        // Initialize the database
        insertedLeave = leaveRepository.saveAndFlush(leave);

        // Get all the leaveList
        restLeaveMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(leave.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].fromDate").value(hasItem(DEFAULT_FROM_DATE.toString())))
            .andExpect(jsonPath("$.[*].toDate").value(hasItem(DEFAULT_TO_DATE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllLeavesWithEagerRelationshipsIsEnabled() throws Exception {
        when(leaveServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restLeaveMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(leaveServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllLeavesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(leaveServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restLeaveMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(leaveRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getLeave() throws Exception {
        // Initialize the database
        insertedLeave = leaveRepository.saveAndFlush(leave);

        // Get the leave
        restLeaveMockMvc
            .perform(get(ENTITY_API_URL_ID, leave.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(leave.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.fromDate").value(DEFAULT_FROM_DATE.toString()))
            .andExpect(jsonPath("$.toDate").value(DEFAULT_TO_DATE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingLeave() throws Exception {
        // Get the leave
        restLeaveMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingLeave() throws Exception {
        // Initialize the database
        insertedLeave = leaveRepository.saveAndFlush(leave);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leave
        Leave updatedLeave = leaveRepository.findById(leave.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedLeave are not directly saved in db
        em.detach(updatedLeave);
        updatedLeave
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fromDate(UPDATED_FROM_DATE)
            .toDate(UPDATED_TO_DATE)
            .status(UPDATED_STATUS);
        LeaveDTO leaveDTO = leaveMapper.toDto(updatedLeave);

        restLeaveMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO))
            )
            .andExpect(status().isOk());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedLeaveToMatchAllProperties(updatedLeave);
    }

    @Test
    @Transactional
    void putNonExistingLeave() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leave.setId(longCount.incrementAndGet());

        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchLeave() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leave.setId(longCount.incrementAndGet());

        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLeave() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leave.setId(longCount.incrementAndGet());

        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateLeaveWithPatch() throws Exception {
        // Initialize the database
        insertedLeave = leaveRepository.saveAndFlush(leave);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leave using partial update
        Leave partialUpdatedLeave = new Leave();
        partialUpdatedLeave.setId(leave.getId());

        partialUpdatedLeave.description(UPDATED_DESCRIPTION).fromDate(UPDATED_FROM_DATE).toDate(UPDATED_TO_DATE);

        restLeaveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeave.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeave))
            )
            .andExpect(status().isOk());

        // Validate the Leave in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedLeave, leave), getPersistedLeave(leave));
    }

    @Test
    @Transactional
    void fullUpdateLeaveWithPatch() throws Exception {
        // Initialize the database
        insertedLeave = leaveRepository.saveAndFlush(leave);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leave using partial update
        Leave partialUpdatedLeave = new Leave();
        partialUpdatedLeave.setId(leave.getId());

        partialUpdatedLeave
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fromDate(UPDATED_FROM_DATE)
            .toDate(UPDATED_TO_DATE)
            .status(UPDATED_STATUS);

        restLeaveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeave.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeave))
            )
            .andExpect(status().isOk());

        // Validate the Leave in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveUpdatableFieldsEquals(partialUpdatedLeave, getPersistedLeave(partialUpdatedLeave));
    }

    @Test
    @Transactional
    void patchNonExistingLeave() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leave.setId(longCount.incrementAndGet());

        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, leaveDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLeave() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leave.setId(longCount.incrementAndGet());

        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLeave() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leave.setId(longCount.incrementAndGet());

        // Create the Leave
        LeaveDTO leaveDTO = leaveMapper.toDto(leave);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(leaveDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Leave in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteLeave() throws Exception {
        // Initialize the database
        insertedLeave = leaveRepository.saveAndFlush(leave);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the leave
        restLeaveMockMvc
            .perform(delete(ENTITY_API_URL_ID, leave.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return leaveRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Leave getPersistedLeave(Leave leave) {
        return leaveRepository.findById(leave.getId()).orElseThrow();
    }

    protected void assertPersistedLeaveToMatchAllProperties(Leave expectedLeave) {
        assertLeaveAllPropertiesEquals(expectedLeave, getPersistedLeave(expectedLeave));
    }

    protected void assertPersistedLeaveToMatchUpdatableProperties(Leave expectedLeave) {
        assertLeaveAllUpdatablePropertiesEquals(expectedLeave, getPersistedLeave(expectedLeave));
    }
}
