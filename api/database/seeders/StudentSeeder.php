<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\{Course, Enrollment, LessonProgress, User};
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // nama => [email, [slug course => jumlah lesson selesai]]
        $students = [
            ['Andi Pratama', 'andi@learnpath.test', ['dasar-pemrograman-web' => 6, 'laravel-untuk-pemula' => 3]],
            ['Rina Kusuma', 'rina@learnpath.test', ['react-next-js-modern' => 4, 'uiux-design-fundamentals' => 2]],
            ['Dewi Lestari', 'dewi@learnpath.test', ['pengantar-data-science' => 6]],
            ['Fajar Nugroho', 'fajar@learnpath.test', ['manajemen-proyek-dasar' => 1, 'dasar-pemrograman-web' => 2]],
            ['Maya Anggraini', 'maya@learnpath.test', ['laravel-untuk-pemula' => 5]],
            ['Tono Wibowo', 'tono@learnpath.test', []], // belum enroll
        ];

        foreach ($students as [$name, $email, $enrolls]) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'student',
            ]);

            foreach ($enrolls as $slug => $doneCount) {
                $course = Course::where('slug', $slug)->first();
                if (! $course) continue;

                $lessonIds = $course->lessons()->orderBy('modules.order')->orderBy('lessons.order')->pluck('lessons.id');
                $done = $lessonIds->take($doneCount);

                foreach ($done as $i => $lessonId) {
                    LessonProgress::create([
                        'user_id' => $user->id,
                        'lesson_id' => $lessonId,
                        'completed_at' => now()->subDays($done->count() - $i),
                        'status' => 'completed',
                    ]);
                }

                Enrollment::create([
                    'user_id' => $user->id,
                    'course_id' => $course->id,
                    'status' => $doneCount >= $lessonIds->count() ? 'completed' : 'active',
                    'last_lesson_id' => $done->last(),
                ]);
            }
        }
    }
}
