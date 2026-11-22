<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\{Assignment, Category, Course, User};
use Illuminate\Support\Str;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            ['Dasar Pemrograman Web', 'Web Development', 'beginner', 'budi@learnpath.test', [
                'HTML & CSS' => ['Apa itu Web', 'Struktur HTML', 'Dasar CSS'],
                'JavaScript Dasar' => ['Variabel dan Tipe Data', 'Fungsi', 'Manipulasi DOM'],
            ]],
            ['Laravel untuk Pemula', 'Web Development', 'intermediate', 'budi@learnpath.test', [
                'Pengenalan Laravel' => ['Instalasi', 'Routing', 'Controller'],
                'Database & Eloquent' => ['Migration', 'Model', 'Relasi'],
            ]],
            ['React & Next.js Modern', 'Web Development', 'intermediate', 'sari@learnpath.test', [
                'Fondasi React' => ['Komponen', 'State dan Props', 'Hooks'],
                'Next.js' => ['Routing', 'Data Fetching', 'Deployment'],
            ]],
            ['Pengantar Data Science', 'Data & AI', 'beginner', 'sari@learnpath.test', [
                'Dasar Data' => ['Apa itu Data Science', 'Jenis Data', 'Alur Kerja'],
                'Analisis Sederhana' => ['Statistik Dasar', 'Visualisasi', 'Studi Kasus'],
            ]],
            ['UI/UX Design Fundamentals', 'Design', 'beginner', 'sari@learnpath.test', [
                'Prinsip Desain' => ['Tipografi', 'Warna', 'Layout'],
                'Proses UX' => ['Riset Pengguna', 'Wireframe', 'Prototyping'],
            ]],
            ['Manajemen Proyek Dasar', 'Business', 'beginner', 'budi@learnpath.test', [
                'Konsep Proyek' => ['Siklus Proyek', 'Ruang Lingkup', 'Stakeholder'],
                'Eksekusi' => ['Penjadwalan', 'Manajemen Risiko', 'Pelaporan'],
            ]],
        ];

        foreach ($courses as [$title, $cat, $level, $email, $modules]) {
            $course = Course::create([
                'category_id' => Category::where('name', $cat)->value('id'),
                'instructor_id' => User::where('email', $email)->value('id'),
                'title' => $title,
                'slug' => Str::slug($title),
                'description' => "Kursus $title: belajar bertahap dari konsep dasar hingga praktik langsung.",
                'thumbnail' => 'https://picsum.photos/seed/' . Str::slug($title) . '/640/360',
                'level' => $level,
                'status' => 'published',
            ]);

            $total = 0;
            foreach (array_keys($modules) as $mIndex => $mTitle) {
                $module = $course->modules()->create(['title' => $mTitle, 'order' => $mIndex + 1]);
                foreach ($modules[$mTitle] as $lIndex => $lTitle) {
                    $module->lessons()->create([
                        'title' => $lTitle,
                        'description' => "Pembahasan: $lTitle",
                        'content' => "Ini materi teks untuk **$lTitle** pada kursus $title. Pelajari konsepnya, lalu praktikkan.",
                        'video_url' => 'https://www.youtube.com/embed/ysz5S6PUM-U',
                        'duration' => 10,
                        'order' => $lIndex + 1,
                    ]);
                    $total += 10;
                }
            }
            $course->update(['duration' => $total]);

            Assignment::create([
                'course_id' => $course->id,
                'title' => "Tugas Akhir: $title",
                'description' => 'Tuliskan ringkasan apa yang kamu pelajari dan satu contoh penerapannya.',
                'deadline' => now()->addDays(7),
            ]);
        }
    }
}
