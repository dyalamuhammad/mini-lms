<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // otorisasi per-course dicek di controller
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'category_id' => ['required', 'exists:categories,id'],
            'description' => ['required', 'string', 'min:10'],
            'thumbnail' => ['nullable', 'url'],
            'level' => ['required', 'in:beginner,intermediate,advanced'],
            'status' => ['required', 'in:draft,published'],
        ];
    }
}
