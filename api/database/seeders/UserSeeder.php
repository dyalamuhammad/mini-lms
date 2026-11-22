<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create(['name' => 'Demo Student', 'email' => 'student@learnpath.test', 'password' => Hash::make('password'), 'role' => 'student']);
        User::create(['name' => 'Admin LearnPath', 'email' => 'admin@learnpath.test', 'password' => Hash::make('password'), 'role' => 'admin']);
        User::create(['name' => 'Budi Santoso', 'email' => 'budi@learnpath.test', 'password' => Hash::make('password'), 'role' => 'admin']);
        User::create(['name' => 'Sari Wijaya', 'email' => 'sari@learnpath.test', 'password' => Hash::make('password'), 'role' => 'admin']);
    }
}
