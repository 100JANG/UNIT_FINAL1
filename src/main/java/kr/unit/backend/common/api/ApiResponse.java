package kr.unit.backend.common.api;

public record ApiResponse<T>(String code, String message, T result) {

    public static <T> ApiResponse<T> success(T result) {
        return new ApiResponse<>("SUCCESS", "Success", result);
    }

    public static <T> ApiResponse<T> success(String message, T result) {
        return new ApiResponse<>("SUCCESS", message, result);
    }

    public static <T> ApiResponse<T> error(String code, String message, T result) {
        return new ApiResponse<>(code, message, result);
    }
}
