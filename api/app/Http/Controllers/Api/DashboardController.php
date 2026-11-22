<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Services\ProgressService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private ProgressService $progress) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $enrollments = Enrollment::with('course:id,title,slug,thumbnail', 'lastLesson:id,title')
            ->where('user_id', $user->id)
            ->get();

        $courses = $enrollments->map(function ($e) use ($user) {
            $p = $this->progress->forCourse($user->id, $e->course);

            return [
                'course_id' => $e->course->id,
                'title' => $e->course->title,
                'slug' => $e->course->slug,
                'thumbnail' => $e->course->thumbnail,
                'status' => $e->status,
                'percentage' => $p['percentage'],
                'completed_lessons' => $p['completed_lessons'],
                'total_lessons' => $p['total_lessons'],
                'last_lesson_id' => $e->last_lesson_id,
                'last_lesson_title' => $e->lastLesson?->title,
            ];
        });

        $total = $courses->count();
        $completed = $courses->where('status', 'completed')->count();

        $submittedIds = AssignmentSubmission::where('user_id', $user->id)->pluck('assignment_id');

        $upcoming = Assignment::with('course:id,title')
            ->whereIn('course_id', $enrollments->pluck('course_id'))
            ->whereNotIn('id', $submittedIds)
            ->where('deadline', '>=', now())
            ->orderBy('deadline')
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'course' => $a->course->title,
                'deadline' => $a->deadline,
            ]);

        $recent = LessonProgress::with('lesson.module.course:id,title')
            ->where('user_id', $user->id)
            ->latest('completed_at')
            ->limit(5)
            ->get()
            ->map(fn($lp) => [
                'lesson' => $lp->lesson->title,
                'course' => $lp->lesson->module->course->title,
                'completed_at' => $lp->completed_at,
            ]);

        return response()->json([
            'data' => [
                'user' => $user->only('id', 'name'),
                'stats' => [
                    'total_courses' => $total,
                    'in_progress' => $total - $completed,
                    'completed' => $completed,
                    'overall_progress' => $total > 0 ? (int) round($courses->avg('percentage')) : 0,
                ],
                'continue_learning' => $courses->where('status', 'active')->first(),
                'courses' => $courses->values(),
                'upcoming_assignments' => $upcoming,
                'recent_activity' => $recent,
            ],
        ]);
    }
}
