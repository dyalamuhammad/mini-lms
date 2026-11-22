<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitAssignmentRequest;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $courseIds = Enrollment::where('user_id', $userId)->pluck('course_id');

        $assignments = Assignment::with([
            'course:id,title',
            'submissions' => fn($q) => $q->where('user_id', $userId),
        ])
            ->whereIn('course_id', $courseIds)
            ->orderBy('deadline')
            ->get()
            ->map(fn($a) => $this->format($a));

        return response()->json(['data' => $assignments]);
    }

    public function show(Request $request, Assignment $assignment)
    {
        $this->ensureEnrolled($request->user()->id, $assignment->course_id);

        $assignment->load([
            'course:id,title',
            'submissions' => fn($q) => $q->where('user_id', $request->user()->id),
        ]);

        return response()->json(['data' => $this->format($assignment, true)]);
    }

    public function submit(SubmitAssignmentRequest $request, Assignment $assignment)
    {
        $userId = $request->user()->id;
        $this->ensureEnrolled($userId, $assignment->course_id);

        if ($assignment->deadline && $assignment->deadline->isPast()) {
            return response()->json(['message' => 'Deadline sudah lewat.'], 422);
        }

        $submission = AssignmentSubmission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'user_id' => $userId],
            ['submission_text' => $request->submission_text, 'submitted_at' => now(), 'status' => 'submitted']
        );

        return response()->json(['message' => 'Tugas berhasil dikirim.', 'data' => $submission], 201);
    }

    private function format(Assignment $a, bool $detail = false): array
    {
        $submission = $a->submissions->first();

        return [
            'id' => $a->id,
            'title' => $a->title,
            'course' => $a->course->title,
            'deadline' => $a->deadline,
            'status' => $submission ? 'submitted' : 'pending',
            'description' => $detail ? $a->description : null,
            'submission_text' => $detail ? $submission?->submission_text : null,
            'submitted_at' => $detail ? $submission?->submitted_at : null,
        ];
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
