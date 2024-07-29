package com.mycompany.myapp.service.mapper;

import static com.mycompany.myapp.domain.LeaveAsserts.*;
import static com.mycompany.myapp.domain.LeaveTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LeaveMapperTest {

    private LeaveMapper leaveMapper;

    @BeforeEach
    void setUp() {
        leaveMapper = new LeaveMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getLeaveSample1();
        var actual = leaveMapper.toEntity(leaveMapper.toDto(expected));
        assertLeaveAllPropertiesEquals(expected, actual);
    }
}
