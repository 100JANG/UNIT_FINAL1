// Maps backend Course DTOs -> UI shapes.
// Contract: docs/backend-contract/01_FRONTEND_API_CONTRACT.md §7.

import type {
  CourseDetailDto,
  CourseDetailUi,
  CourseSummary,
  CourseSummaryDto,
} from '../../../types/course';

export function mapCourseSummary(dto: CourseSummaryDto): CourseSummary {
  return {
    courseId: dto.courseId,
    schoolId: dto.schoolId,
    name: dto.courseName,
    professor: dto.professor,
    semester: dto.semester,
  };
}

export function mapCourseDetail(dto: CourseDetailDto): CourseDetailUi {
  const recommend = dto.recommend ?? 0;
  const notRecommend = dto.notRecommend ?? 0;
  const skip = dto.skip ?? 0;
  const total = dto.total ?? recommend + notRecommend + skip;

  // recommendRate is 0..1 from the backend; UI shows percent.
  const recommendPct = Math.round((dto.recommendRate ?? 0) * 100);

  return {
    courseId: dto.courseId,
    name: dto.courseName,
    professor: dto.professor,
    semester: dto.semester,
    stats: {
      recommend,
      notRecommend,
      skip,
      total,
      recommendPct,
    },
  };
}
