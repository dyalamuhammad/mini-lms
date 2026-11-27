<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['data' => []]);
        }

        $courseIds = Enrollment::where('user_id', $user->id)->pluck('course_id');
        $submitted = AssignmentSubmission::where('user_id', $user->id)->pluck('assignment_id');
        $items = collect();

        Assignment::with('course:id,title')
            ->whereIn('course_id', $courseIds)
            ->whereNotIn('id', $submitted)
            ->whereBetween('deadline', [now()->subDays(7), now()->addDays(3)])
            ->orderBy('deadline')
            ->get()
            ->each(function ($a) use ($items) {
                $past = $a->deadline->isPast();
                $items->push([
                    'id' => "assignment-{$a->id}",
                    'type' => $past ? 'overdue' : 'deadline',
                    'message' => $past
                        ? "Tugas \"{$a->title}\" sudah lewat deadline."
                        : "Tugas \"{$a->title}\" ({$a->course->title}) mendekati deadline.",
                    'link' => "/assignments/{$a->id}",
                    'time' => $a->deadline,
                ]);
            });

        Enrollment::with('course:id,title')
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->get()
            ->each(function ($e) use ($items) {
                $items->push([
                    'id' => "completed-{$e->id}",
                    'type' => 'completed',
                    'message' => "Selamat! Kamu menyelesaikan \"{$e->course->title}\". Sertifikat siap diambil.",
                    'link' => "/certificate/{$e->course_id}",
                    'time' => $e->updated_at,
                ]);
            });

        return response()->json(['data' => $items->values()]);
    }
}
