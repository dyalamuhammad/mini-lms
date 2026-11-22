<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $enrollment = $request->user()
            ? $this->enrollments->firstWhere('user_id', $request->user()->id)
            : null;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'duration' => $this->duration,
            'level' => $this->level,
            'category' => $this->category?->name,
            'instructor' => $this->instructor?->name,
            'is_enrolled' => (bool) $enrollment,
        ];
    }
}
