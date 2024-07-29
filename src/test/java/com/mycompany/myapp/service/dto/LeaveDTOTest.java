package com.mycompany.myapp.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class LeaveDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(LeaveDTO.class);
        LeaveDTO leaveDTO1 = new LeaveDTO();
        leaveDTO1.setId(1L);
        LeaveDTO leaveDTO2 = new LeaveDTO();
        assertThat(leaveDTO1).isNotEqualTo(leaveDTO2);
        leaveDTO2.setId(leaveDTO1.getId());
        assertThat(leaveDTO1).isEqualTo(leaveDTO2);
        leaveDTO2.setId(2L);
        assertThat(leaveDTO1).isNotEqualTo(leaveDTO2);
        leaveDTO1.setId(null);
        assertThat(leaveDTO1).isNotEqualTo(leaveDTO2);
    }
}
