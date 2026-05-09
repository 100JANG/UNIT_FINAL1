package kr.unit.backend.jury.domain;

public enum JuryCaseStatus {
    RESERVED,
    OPEN,
    RESOLVED,
    NEEDS_ADMIN_REVIEW,
    CLOSED_EXPIRED,
    CANCELLED
}
