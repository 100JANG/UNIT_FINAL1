/**
 * Feature flags for v2 screen rollout.
 *
 * Per docs/handoff/07_PR_PLAN.md PR-11~14 — toggle individual domains
 * to swap legacy NativeWind screens for v2 StyleSheet versions.
 *
 * Default everything to true now that v2 is built; flip a key to false
 * to roll back a single domain instantly.
 */

export const flags = {
  unitV2: {
    profile: true,        // PR-11 — Jury/Notifications/Profile
    courses: true,        // PR-12 — Courses/CourseDetail/CourseReview
    chat:    true,        // PR-13 — ChatList/ChatRoom
    feed:    true,        // PR-14 — Feed/PostDetail/Write
  },
} as const;
