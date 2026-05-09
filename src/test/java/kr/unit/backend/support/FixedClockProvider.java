package kr.unit.backend.support;

import kr.unit.backend.common.time.ClockProvider;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

public class FixedClockProvider extends ClockProvider {

    public FixedClockProvider(Instant fixed) {
        super(Clock.fixed(fixed, ZoneOffset.UTC));
    }

    public static FixedClockProvider at(String iso) {
        return new FixedClockProvider(Instant.parse(iso));
    }
}
