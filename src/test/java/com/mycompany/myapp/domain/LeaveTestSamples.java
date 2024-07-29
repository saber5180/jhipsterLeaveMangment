package com.mycompany.myapp.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class LeaveTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Leave getLeaveSample1() {
        return new Leave().id(1L).title("title1").description("description1");
    }

    public static Leave getLeaveSample2() {
        return new Leave().id(2L).title("title2").description("description2");
    }

    public static Leave getLeaveRandomSampleGenerator() {
        return new Leave().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString()).description(UUID.randomUUID().toString());
    }
}
