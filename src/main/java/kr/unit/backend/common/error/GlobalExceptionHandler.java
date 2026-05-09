package kr.unit.backend.common.error;

import jakarta.validation.ConstraintViolationException;
import kr.unit.backend.common.api.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex) {
        ErrorCode code = ex.errorCode();
        log.debug("Business exception: code={} message={}", code.name(), ex.getMessage());
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), ex.getMessage(), ex.detail()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(AuthenticationException ex) {
        ErrorCode code = ErrorCode.AUTH_INVALID;
        log.debug("Authentication exception: {}", ex.getMessage());
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        ErrorCode code = ErrorCode.FORBIDDEN;
        log.debug("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex) {
        List<ValidationFailureDetail.FieldError> fields = ex.getConstraintViolations().stream()
                .map(v -> new ValidationFailureDetail.FieldError(
                        v.getPropertyPath().toString(),
                        v.getMessage()))
                .toList();
        ErrorCode code = ErrorCode.VALIDATION_FAILED;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), new ValidationFailureDetail(fields)));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorCode code = ErrorCode.INVALID_REQUEST;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnknown(Exception ex) {
        log.error("Unhandled exception", ex);
        ErrorCode code = ErrorCode.INTERNAL_ERROR;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        List<ValidationFailureDetail.FieldError> fields = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ValidationFailureDetail.FieldError(
                        fe.getField(),
                        fe.getDefaultMessage()))
                .toList();
        ErrorCode code = ErrorCode.VALIDATION_FAILED;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), new ValidationFailureDetail(fields)));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        ErrorCode code = ErrorCode.INVALID_REQUEST;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }

    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        ErrorCode code = ErrorCode.METHOD_NOT_ALLOWED;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMediaTypeNotSupported(
            HttpMediaTypeNotSupportedException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        ErrorCode code = ErrorCode.UNSUPPORTED_MEDIA_TYPE;
        return ResponseEntity
                .status(code.status())
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }

    @Override
    protected ResponseEntity<Object> handleNoHandlerFoundException(
            NoHandlerFoundException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        ErrorCode code = ErrorCode.NOT_FOUND;
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(code.name(), code.defaultMessage(), null));
    }
}
