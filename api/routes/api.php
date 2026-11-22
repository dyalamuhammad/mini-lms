<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\LearningController;

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
});
