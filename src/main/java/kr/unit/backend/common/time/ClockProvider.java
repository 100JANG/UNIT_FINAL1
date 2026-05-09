package kr.unit.backend.common.time;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;

@Component
public class ClockProvider {

    private final Clock clock;

    public ClockProvider() {
        this(Clock.systemUTC());
    }

    public ClockProvider(Clock clock) {
        this.clock = clock;
    }

    public Instant now() {
        return Instant.now(clock);
    }

    public long epochMilli() {
        return clock.millis();
    }
}
