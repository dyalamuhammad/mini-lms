<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewRequest;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, Course $course)
    {
        $reviews = $course->reviews()->with('user:id,name')->latest()->limit(20)->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'user' => $r->user->name,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
                'is_mine' => $r->user_id === $request->user()->id,
            ]);

        return response()->json(['data' => [
            'average' => round((float) $course->reviews()->avg('rating'), 1),
            'count' => $course->reviews()->count(),
            'reviews' => $reviews,
        ]]);
    }

    public function store(ReviewRequest $request, Course $course)
    {
        $user = $request->user();

        abort_unless(
            Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists(),
            403,
            'Hanya student yang terdaftar yang bisa memberi ulasan.'
        );

        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'course_id' => $course->id],
            $request->validated()
        );

        return response()->json(['message' => 'Ulasan disimpan.', 'data' => $review], 201);
    }
}
