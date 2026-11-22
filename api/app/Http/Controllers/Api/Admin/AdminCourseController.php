<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use App\Models\Course;
use App\Support\Paginated;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCourseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $page = Course::with('category:id,name')
            ->withCount(['modules', 'lessons', 'enrollments'])
            ->when($user->role !== 'admin', fn($q) => $q->where('instructor_id', $user->id))
            ->latest()
            ->paginate(5);

        $courses = $page->through(fn($c) => [
            'id' => $c->id,
            'title' => $c->title,
            'status' => $c->status,
            'level' => $c->level,
            'category' => $c->category?->name,
            'modules_count' => $c->modules_count,
            'lessons_count' => $c->lessons_count,
            'enrollments_count' => $c->enrollments_count,
        ]);

        return response()->json(['data' => $courses->items(), 'meta' => Paginated::meta($page)]);
    }

    public function show(Request $request, Course $course)
    {
        $this->authorizeCourse($request, $course);

        return response()->json(['data' => $course]);
    }

    public function store(CourseRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['instructor_id'] = $request->user()->id;

        $course = Course::create($data);

        return response()->json(['message' => 'Course dibuat.', 'data' => $course], 201);
    }

    public function update(CourseRequest $request, Course $course)
    {
        $this->authorizeCourse($request, $course);
        $course->update($request->validated()); // slug sengaja tidak diubah agar link lama tetap valid

        return response()->json(['message' => 'Course diperbarui.', 'data' => $course]);
    }

    public function destroy(Request $request, Course $course)
    {
        $this->authorizeCourse($request, $course);

        if ($course->enrollments()->exists()) {
            return response()->json(['message' => 'Course sudah punya student. Ubah status ke draft saja.'], 409);
        }

        $course->delete();

        return response()->json(['message' => 'Course dihapus.']);
    }

    private function authorizeCourse(Request $request, Course $course): void
    {
        abort_unless(
            $request->user()->role === 'admin' || $course->instructor_id === $request->user()->id,
            403,
            'Ini bukan course milikmu.'
        );
    }

    private function uniqueSlug(string $title): string
    {
        $slug = $base = Str::slug($title);
        $i = 2;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}
