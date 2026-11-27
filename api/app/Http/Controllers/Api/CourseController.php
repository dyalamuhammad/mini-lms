<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $courses = Course::with(['category', 'instructor', 'enrollments' => fn($q) => $q->where('user_id', $request->user()->id)])
            ->where('status', 'published')
            ->when($request->search, fn($q, $s) => $q->where('title', 'like', "%$s%"))
            ->when($request->category_id, fn($q, $c) => $q->where('category_id', $c))
            ->latest()
            ->paginate(6);

        return CourseResource::collection($courses);
    }

    public function show(Request $request, string $slug)
    {
        $course = Course::with(['category', 'instructor', 'enrollments' => fn($q) => $q->where('user_id', $request->user()->id)])
            ->where('status', 'published')
            ->withCount(['modules', 'lessons'])
            ->where('slug', $slug)
            ->firstOrFail();

        return (new CourseResource($course))->additional([
            'meta' => [
                'modules_count' => $course->modules_count,
                'lessons_count' => $course->lessons_count,
            ],
        ]);
    }

    public function myCourses(Request $request)
    {
        $courses = Course::with(['category', 'instructor', 'enrollments' => fn($q) => $q->where('user_id', $request->user()->id)])
            ->whereHas('enrollments', fn($q) => $q->where('user_id', $request->user()->id))
            ->get();

        return CourseResource::collection($courses);
    }

    public function enroll(Request $request, Course $course)
    {
        abort_unless($request->user()->role === 'student', 403, 'Hanya student yang bisa enroll.');
        abort_unless($course->status === 'published', 404);
        $enrollment = Enrollment::firstOrCreate(
            ['user_id' => $request->user()->id, 'course_id' => $course->id],
            ['status' => 'active']
        );

        if (! $enrollment->wasRecentlyCreated) {
            return response()->json(['message' => 'Kamu sudah terdaftar di course ini.'], 409);
        }

        return response()->json(['message' => 'Berhasil enroll.', 'data' => $enrollment], 201);
    }
}
