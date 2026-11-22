<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\ProgressService;
use App\Support\Paginated;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(private ProgressService $progress) {}

    // admin: semua course, instructor: hanya course miliknya
    private function courseIds(Request $request)
    {
        $user = $request->user();

        return $user->role === 'admin'
            ? Course::pluck('id')
            : Course::where('instructor_id', $user->id)->pluck('id');
    }

    public function stats(Request $request)
    {
        $ids = $this->courseIds($request);
        $isAdmin = $request->user()->role === 'admin';

        return response()->json(['data' => [
            'students' => $isAdmin
                ? User::where('role', 'student')->count()
                : Enrollment::whereIn('course_id', $ids)->distinct()->count('user_id'),
            'courses' => $ids->count(),
            'enrollments' => Enrollment::whereIn('course_id', $ids)->count(),
            'completed_enrollments' => Enrollment::whereIn('course_id', $ids)->where('status', 'completed')->count(),
        ]]);
    }

    public function students(Request $request)
    {
        $ids = $this->courseIds($request);
        $isAdmin = $request->user()->role === 'admin';

        $page = User::where('role', 'student')
            ->with(['enrollments' => fn($q) => $q->whereIn('course_id', $ids)->with('course')])
            ->when(! $isAdmin, fn($q) => $q->whereHas('enrollments', fn($e) => $e->whereIn('course_id', $ids)))
            ->orderBy('name')
            ->paginate(5);

        $students = $page->through(fn($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'courses' => $u->enrollments->map(fn($e) => [
                'title' => $e->course->title,
                'status' => $e->status,
                'percentage' => $this->progress->forCourse($u->id, $e->course)['percentage'],
            ])->values(),
        ]);

        return response()->json(['data' => $students->items(), 'meta' => Paginated::meta($page)]);
    }
}
