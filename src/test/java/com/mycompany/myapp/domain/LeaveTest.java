package com.mycompany.myapp.domain;

import static com.mycompany.myapp.domain.EmployeeTestSamples.*;
import static com.mycompany.myapp.domain.LeaveTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mycompany.myapp.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class LeaveTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Leave.class);
        Leave leave1 = getLeaveSample1();
        Leave leave2 = new Leave();
        assertThat(leave1).isNotEqualTo(leave2);

        leave2.setId(leave1.getId());
        assertThat(leave1).isEqualTo(leave2);

        leave2 = getLeaveSample2();
        assertThat(leave1).isNotEqualTo(leave2);
    }

    @Test
    void employeeTest() {
        Leave leave = getLeaveRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        leave.setEmployee(employeeBack);
        assertThat(leave.getEmployee()).isEqualTo(employeeBack);

        leave.employee(null);
        assertThat(leave.getEmployee()).isNull();
    }
}
