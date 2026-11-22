<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Services\ProgressService;

class AdminController extends Controller
{
    public function __construct(private ProgressService $progress) {}

    public function stats()
    {
        return response()->json(['data' => [
            'students' => User::where('role', 'student')->count(),
            'courses' => Course::count(),
            'enrollments' => Enrollment::count(),
            'completed_enrollments' => Enrollment::where('status', 'completed')->count(),
        ]]);
    }

    public function students()
    {
        $students = User::where('role', 'student')
            ->with('enrollments.course')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'courses' => $u->enrollments->map(fn($e) => [
                    'title' => $e->course->title,
                    'status' => $e->status,
                    'percentage' => $this->progress->forCourse($u->id, $e->course)['percentage'],
                ]),
            ]);

        return response()->json(['data' => $students]);
    }
}
