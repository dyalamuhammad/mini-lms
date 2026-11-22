<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Http\Request;

class AdminAssignmentController extends Controller
{
    public function index(Request $request, Course $course)
    {
        $this->authorizeCourse($request, $course);

        $assignments = $course->assignments()
            ->withCount('submissions')
            ->orderBy('deadline')
            ->get();

        return response()->json(['data' => [
            'course' => $course->only('id', 'title'),
            'assignments' => $assignments,
        ]]);
    }

    public function store(Request $request, Course $course)
    {
        $this->authorizeCourse($request, $course);

        $assignment = $course->assignments()->create($this->validated($request));

        return response()->json(['data' => $assignment], 201);
    }

    public function update(Request $request, Assignment $assignment)
    {
        $this->authorizeCourse($request, $assignment->course);
        $assignment->update($this->validated($request));

        return response()->json(['data' => $assignment]);
    }

    public function destroy(Request $request, Assignment $assignment)
    {
        $this->authorizeCourse($request, $assignment->course);

        if ($assignment->submissions()->exists()) {
            return response()->json(['message' => 'Tugas sudah punya jawaban student, tidak bisa dihapus.'], 409);
        }

        $assignment->delete();

        return response()->json(['message' => 'Tugas dihapus.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'min:10'],
            'deadline' => ['nullable', 'date'],
        ]);
    }

    private function authorizeCourse(Request $request, Course $course): void
    {
        abort_unless(
            $request->user()->role === 'admin' || $course->instructor_id === $request->user()->id,
            403,
            'Ini bukan course milikmu.'
        );
    }
    public function submissions(Request $request, Assignment $assignment)
    {
        $this->authorizeCourse($request, $assignment->course);

        $submissions = $assignment->submissions()
            ->with('user:id,name,email')
            ->latest('submitted_at')
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'student' => $s->user->name,
                'email' => $s->user->email,
                'submission_text' => $s->submission_text,
                'submitted_at' => $s->submitted_at,
            ]);

        return response()->json(['data' => [
            'assignment' => $assignment->only('id', 'title', 'deadline'),
            'course' => $assignment->course->only('id', 'title'),
            'submissions' => $submissions,
        ]]);
    }
}
