<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\Request;

class CurriculumController extends Controller
{
    public function show(Request $request, Course $course)
    {
        $this->authorizeCourse($request, $course);

        $course->load('modules.lessons');

        return response()->json(['data' => [
            'course' => $course->only('id', 'title'),
            'modules' => $course->modules,
        ]]);
    }

    public function storeModule(Request $request, Course $course)
    {
        $this->authorizeCourse($request, $course);
        $data = $request->validate(['title' => ['required', 'string', 'max:150']]);

        $module = $course->modules()->create($data + ['order' => ($course->modules()->max('order') ?? 0) + 1]);

        return response()->json(['data' => $module], 201);
    }

    public function updateModule(Request $request, Module $module)
    {
        $this->authorizeCourse($request, $module->course);
        $module->update($request->validate(['title' => ['required', 'string', 'max:150']]));

        return response()->json(['data' => $module]);
    }

    public function destroyModule(Request $request, Module $module)
    {
        $course = $module->course;
        $this->authorizeCourse($request, $course);
        $this->guardNoEnrollment($course);

        $module->delete();
        $this->syncDuration($course);

        return response()->json(['message' => 'Modul dihapus.']);
    }

    public function storeLesson(Request $request, Module $module)
    {
        $this->authorizeCourse($request, $module->course);
        $data = $this->validateLesson($request);

        $lesson = $module->lessons()->create($data + ['order' => ($module->lessons()->max('order') ?? 0) + 1]);
        $this->syncDuration($module->course);

        return response()->json(['data' => $lesson], 201);
    }

    public function updateLesson(Request $request, Lesson $lesson)
    {
        $course = $lesson->module->course;
        $this->authorizeCourse($request, $course);

        $lesson->update($this->validateLesson($request));
        $this->syncDuration($course);

        return response()->json(['data' => $lesson]);
    }

    public function destroyLesson(Request $request, Lesson $lesson)
    {
        $course = $lesson->module->course;
        $this->authorizeCourse($request, $course);
        $this->guardNoEnrollment($course);

        $lesson->delete();
        $this->syncDuration($course);

        return response()->json(['message' => 'Lesson dihapus.']);
    }

    private function validateLesson(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'content' => ['nullable', 'string'],
            'video_url' => ['nullable', 'url'],
            'duration' => ['required', 'integer', 'min:0', 'max:600'],
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

    // menghapus konten saat ada student akan merusak progress mereka
    private function guardNoEnrollment(Course $course): void
    {
        abort_if($course->enrollments()->exists(), 409, 'Course sudah punya student, konten tidak bisa dihapus.');
    }

    private function syncDuration(Course $course): void
    {
        $course->update(['duration' => $course->lessons()->sum('lessons.duration')]);
    }
    public function moveModule(Request $request, Module $module)
    {
        $this->authorizeCourse($request, $module->course);
        $dir = $request->validate(['direction' => ['required', 'in:up,down']])['direction'];

        $this->swap(Module::where('course_id', $module->course_id), $module, $dir);

        return response()->json(['message' => 'Urutan diperbarui.']);
    }

    public function moveLesson(Request $request, Lesson $lesson)
    {
        $this->authorizeCourse($request, $lesson->module->course);
        $dir = $request->validate(['direction' => ['required', 'in:up,down']])['direction'];

        $this->swap(Lesson::where('module_id', $lesson->module_id), $lesson, $dir);

        return response()->json(['message' => 'Urutan diperbarui.']);
    }

    // cari tetangga lalu tukar nilai order
    private function swap($siblings, $item, string $dir): void
    {
        $neighbor = $dir === 'up'
            ? (clone $siblings)->where('order', '<', $item->order)->orderByDesc('order')->first()
            : (clone $siblings)->where('order', '>', $item->order)->orderBy('order')->first();

        if (! $neighbor) {
            return; // sudah paling atas/bawah
        }

        [$a, $b] = [$item->order, $neighbor->order];
        $item->update(['order' => $b]);
        $neighbor->update(['order' => $a]);
    }
}
