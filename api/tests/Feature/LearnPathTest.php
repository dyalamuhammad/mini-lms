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
    public function test_instructor_only_sees_students_in_own_courses(): void
    {
        $category = Category::create(['name' => 'Test']);
        $instructor = User::factory()->create(['role' => 'instructor']);
        $other = User::factory()->create(['role' => 'instructor']);

        $mine = Course::create(['category_id' => $category->id, 'instructor_id' => $instructor->id, 'title' => 'Mine', 'slug' => 'mine', 'description' => 'x']);
        $theirs = Course::create(['category_id' => $category->id, 'instructor_id' => $other->id, 'title' => 'Theirs', 'slug' => 'theirs', 'description' => 'x']);

        $a = User::factory()->create(['role' => 'student']);
        $b = User::factory()->create(['role' => 'student']);
        $a->enrollments()->create(['course_id' => $mine->id]);
        $b->enrollments()->create(['course_id' => $theirs->id]);

        Sanctum::actingAs($instructor);

        $this->getJson('/api/admin/students')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $a->id);
    }

    public function test_instructor_cannot_edit_others_course_and_course_with_students_cannot_be_deleted(): void
    {
        $course = $this->makeCourse(); // instructor = admin factory user
        $intruder = User::factory()->create(['role' => 'instructor']);

        Sanctum::actingAs($intruder);
        $this->putJson("/api/admin/courses/{$course->id}", [
            'title' => 'Hack',
            'category_id' => $course->category_id,
            'description' => 'deskripsi panjang',
            'level' => 'beginner',
            'status' => 'published',
        ])->assertStatus(403);

        $this->enrolledStudent($course);
        Sanctum::actingAs(User::find($course->instructor_id));
        $this->deleteJson("/api/admin/courses/{$course->id}")->assertStatus(409);
    }

    public function test_instructor_can_add_lesson_and_duration_syncs_but_cannot_delete_when_enrolled(): void
    {
        $course = $this->makeCourse();
        $owner = User::find($course->instructor_id);
        $module = $course->modules()->first();

        Sanctum::actingAs($owner);
        $this->postJson("/api/admin/modules/{$module->id}/lessons", ['title' => 'Baru', 'duration' => 15])
            ->assertStatus(201);
        $this->assertEquals(15, $course->fresh()->duration);

        $this->enrolledStudent($course);
        Sanctum::actingAs($owner);
        $lesson = $course->lessons()->first();
        $this->deleteJson("/api/admin/lessons/{$lesson->id}")->assertStatus(409);
    }
    public function test_instructor_manages_assignments_only_in_own_course(): void
    {
        $course = $this->makeCourse();
        $owner = User::find($course->instructor_id);
        $payload = ['title' => 'Tugas 1', 'description' => 'Deskripsi tugas panjang', 'deadline' => now()->addDays(3)->toDateTimeString()];

        Sanctum::actingAs(User::factory()->create(['role' => 'instructor']));
        $this->postJson("/api/admin/courses/{$course->id}/assignments", $payload)->assertStatus(403);

        Sanctum::actingAs($owner);
        $this->postJson("/api/admin/courses/{$course->id}/assignments", $payload)->assertStatus(201);
        $this->assertDatabaseCount('assignments', 1);
    }
    public function test_only_owner_can_read_assignment_submissions(): void
    {
        $course = $this->makeCourse();
        $owner = User::find($course->instructor_id);
        $assignment = $course->assignments()->create(['title' => 'T', 'description' => 'Deskripsi panjang']);

        $student = User::factory()->create(['role' => 'student']);
        $assignment->submissions()->create(['user_id' => $student->id, 'submission_text' => 'Jawaban saya']);

        Sanctum::actingAs(User::factory()->create(['role' => 'instructor']));
        $this->getJson("/api/admin/assignments/{$assignment->id}/submissions")->assertStatus(403);

        Sanctum::actingAs($owner);
        $this->getJson("/api/admin/assignments/{$assignment->id}/submissions")
            ->assertOk()
            ->assertJsonCount(1, 'data.submissions');
    }
    public function test_staff_cannot_enroll(): void
    {
        $course = $this->makeCourse();
        Sanctum::actingAs(User::factory()->create(['role' => 'instructor']));

        $this->postJson("/api/courses/{$course->id}/enroll")->assertStatus(403);
    }
    public function test_user_can_update_name_and_change_password(): void
    {
        $user = User::factory()->create(['name' => 'Lama']);
        Sanctum::actingAs($user);

        $this->putJson('/api/profile', ['name' => 'Baru'])->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Baru']);

        $this->putJson('/api/password', [
            'current_password' => 'salah',
            'password' => 'passwordbaru',
            'password_confirmation' => 'passwordbaru',
        ])->assertStatus(422);

        $this->putJson('/api/password', [
            'current_password' => 'password',
            'password' => 'passwordbaru',
            'password_confirmation' => 'passwordbaru',
        ])->assertOk();
    }
}
