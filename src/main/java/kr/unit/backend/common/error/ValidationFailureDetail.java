package kr.unit.backend.common.error;

import java.util.List;

public record ValidationFailureDetail(List<FieldError> fields) {

    public record FieldError(String field, String reason) {
    }
}
