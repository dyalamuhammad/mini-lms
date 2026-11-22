<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\LearningController;
use App\Http\Controllers\Api\DashboardController;
use App\Models\Category;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\Admin\AdminController;

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{slug}', [CourseController::class, 'show']);
    Route::get('/my-courses', [CourseController::class, 'myCourses']);
    Route::post('/courses/{course}/enroll', [CourseController::class, 'enroll']);


    Route::get('/courses/{course}/curriculum', [LearningController::class, 'curriculum']);
    Route::get('/courses/{course}/progress', [LearningController::class, 'progress']);
    Route::get('/lessons/{lesson}', [LearningController::class, 'lesson']);
    Route::post('/lessons/{lesson}/complete', [LearningController::class, 'complete']);

    Route::get('/dashboard', [DashboardController::class, 'index']);


    Route::get('/categories', fn() => ['data' => Category::select('id', 'name')->get()]);


    Route::get('/my-assignments', [AssignmentController::class, 'index']);
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show']);
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit']);


    Route::middleware('role:admin,instructor')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/students', [AdminController::class, 'students']);
    });

    Route::get('/courses/{course}/certificate', [LearningController::class, 'certificate']);
});
