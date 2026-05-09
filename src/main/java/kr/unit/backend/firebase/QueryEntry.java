package kr.unit.backend.firebase;

/**
 * RealtimeDatabaseClient query 결과 한 항목.
 *
 * key: 부모 path 아래의 자식 노드 이름 (예: postId, commentId)
 * value: 자식 노드의 값 (보통 Map 형태). type 파라미터에 따라 변환된 표현.
 */
public record QueryEntry<T>(String key, T value) {
}
