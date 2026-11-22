<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LearnPathTest extends TestCase
{
    use RefreshDatabase;

    private function makeCourse(): Course
    {
        $instructor = User::factory()->create(['role' => 'admin']);
        $category = Category::create(['name' => 'Test']);

        $course = Course::create([
            'category_id' => $category->id,
            'instructor_id' => $instructor->id,
            'title' => 'Course Test',
            'slug' => 'course-test',
            'description' => 'Deskripsi',
        ]);

        $module = $course->modules()->create(['title' => 'Modul 1', 'order' => 1]);
        $module->lessons()->create(['title' => 'Lesson 1', 'order' => 1]);
        $module->lessons()->create(['title' => 'Lesson 2', 'order' => 2]);

        return $course;
    }

    private function enrolledStudent(Course $course): User
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);
        $this->postJson("/api/courses/{$course->id}/enroll")->assertStatus(201);

        return $student;
    }

    public function test_login_returns_token_with_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'a@test.com']);

        $this->postJson('/api/login', ['email' => 'a@test.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        User::factory()->create(['email' => 'a@test.com']);

        $this->postJson('/api/login', ['email' => 'a@test.com', 'password' => 'salah'])
            ->assertStatus(401);
    }

    public function test_protected_route_requires_token(): void
    {
        $this->getJson('/api/dashboard')->assertStatus(401);
    }

    public function test_student_can_enroll_but_not_twice(): void
    {
        $course = $this->makeCourse();
        $this->enrolledStudent($course);

        $this->postJson("/api/courses/{$course->id}/enroll")->assertStatus(409);
        $this->assertDatabaseCount('enrollments', 1);
    }

    public function test_cannot_open_lesson_without_enrollment(): void
    {
        $course = $this->makeCourse();
        Sanctum::actingAs(User::factory()->create(['role' => 'student']));

        $lessonId = $course->lessons()->first()->id;

        $this->getJson("/api/lessons/{$lessonId}")->assertStatus(403);
        $this->postJson("/api/lessons/{$lessonId}/complete")->assertStatus(403);
    }

    public function test_completing_lesson_updates_progress_and_is_idempotent(): void
    {
        $course = $this->makeCourse();
        $this->enrolledStudent($course);
        $lessonId = $course->lessons()->orderBy('lessons.order')->first()->id;

        $this->postJson("/api/lessons/{$lessonId}/complete")
            ->assertOk()
            ->assertJsonPath('data.percentage', 50);

        // klik ulang tidak membuat data ganda
        $this->postJson("/api/lessons/{$lessonId}/complete")
            ->assertJsonPath('data.percentage', 50);
        $this->assertDatabaseCount('lesson_progress', 1);
    }

    public function test_completing_all_lessons_marks_enrollment_completed(): void
    {
        $course = $this->makeCourse();
        $this->enrolledStudent($course);

        foreach ($course->lessons()->pluck('lessons.id') as $id) {
            $this->postJson("/api/lessons/{$id}/complete");
        }

        $this->assertDatabaseHas('enrollments', ['course_id' => $course->id, 'status' => 'completed']);
    }

    public function test_admin_endpoint_is_forbidden_for_student_and_open_for_admin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'student']));
        $this->getJson('/api/admin/stats')->assertStatus(403);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->getJson('/api/admin/stats')->assertOk();
    }
}
