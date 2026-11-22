<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Services\ProgressService;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    public function __construct(private ProgressService $progress) {}

    public function curriculum(Request $request, Course $course)
    {
        $this->ensureEnrolled($request->user()->id, $course->id);

        $course->load('modules.lessons:id,module_id,title,duration,order');

        return response()->json([
            'data' => [
                'course' => $course->only('id', 'title', 'slug'),
                'modules' => $course->modules->map(fn($m) => [
                    'id' => $m->id,
                    'title' => $m->title,
                    'lessons' => $m->lessons,
                ]),
                'progress' => $this->progress->forCourse($request->user()->id, $course),
                'last_lesson_id' => Enrollment::where('user_id', $request->user()->id)
                    ->where('course_id', $course->id)->value('last_lesson_id'),
            ],
        ]);
    }

    public function lesson(Request $request, Lesson $lesson)
    {
        $lesson->load('module.course');
        $course = $lesson->module->course;
        $userId = $request->user()->id;

        $this->ensureEnrolled($userId, $course->id);

        // simpan lesson terakhir yang dibuka (resume learning)
        Enrollment::where('user_id', $userId)->where('course_id', $course->id)
            ->update(['last_lesson_id' => $lesson->id]);

        // urutan lesson satu course untuk navigasi prev/next
        $ordered = $course->modules()->with('lessons:id,module_id')->get()
            ->flatMap(fn($m) => $m->lessons->pluck('id'))->values();
        $index = $ordered->search($lesson->id);

        return response()->json([
            'data' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'description' => $lesson->description,
                'content' => $lesson->content,
                'video_url' => $lesson->video_url,
                'duration' => $lesson->duration,
                'module' => $lesson->module->title,
                'course' => $course->only('id', 'title', 'slug'),
                'is_completed' => LessonProgress::where('user_id', $userId)->where('lesson_id', $lesson->id)->exists(),
                'prev_lesson_id' => $index > 0 ? $ordered[$index - 1] : null,
                'next_lesson_id' => $ordered[$index + 1] ?? null,
            ],
        ]);
    }

    public function complete(Request $request, Lesson $lesson)
    {
        $lesson->load('module.course');
        $course = $lesson->module->course;
        $userId = $request->user()->id;

        $this->ensureEnrolled($userId, $course->id);

        LessonProgress::firstOrCreate(
            ['user_id' => $userId, 'lesson_id' => $lesson->id],
            ['completed_at' => now(), 'status' => 'completed']
        );

        $this->progress->syncStatus($userId, $course);

        return response()->json([
            'message' => 'Lesson ditandai selesai.',
            'data' => $this->progress->forCourse($userId, $course),
        ]);
    }

    public function progress(Request $request, Course $course)
    {
        $this->ensureEnrolled($request->user()->id, $course->id);

        return response()->json(['data' => $this->progress->forCourse($request->user()->id, $course)]);
    }

    private function ensureEnrolled(int $userId, int $courseId): void
    {
        abort_unless(
            Enrollment::where('user_id', $userId)->where('course_id', $courseId)->exists(),
            403,
            'Kamu belum terdaftar di course ini.'
        );
    }
}
