<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;

class ProgressService
{
    public function forCourse(int $userId, Course $course): array
    {
        $lessonIds = $course->lessons()->pluck('lessons.id');
        $total = $lessonIds->count();

        $completedIds = LessonProgress::where('user_id', $userId)
            ->whereIn('lesson_id', $lessonIds)
            ->pluck('lesson_id');

        $completed = $completedIds->count();

        return [
            'total_lessons' => $total,
            'completed_lessons' => $completed,
            'percentage' => $total > 0 ? (int) round($completed / $total * 100) : 0,
            'completed_lesson_ids' => $completedIds->values(),
        ];
    }

    public function syncStatus(int $userId, Course $course): void
    {
        $progress = $this->forCourse($userId, $course);

        Enrollment::where('user_id', $userId)
            ->where('course_id', $course->id)
            ->update(['status' => $progress['percentage'] === 100 ? 'completed' : 'active']);
    }
}
