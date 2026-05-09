package kr.unit.backend.common.error;

public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private final transient Object detail;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.defaultMessage());
        this.errorCode = errorCode;
        this.detail = null;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.detail = null;
    }

    public BusinessException(ErrorCode errorCode, String message, Object detail) {
        super(message);
        this.errorCode = errorCode;
        this.detail = detail;
    }

    public ErrorCode errorCode() {
        return errorCode;
    }

    public Object detail() {
        return detail;
    }
}
