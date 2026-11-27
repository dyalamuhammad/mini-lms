<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }
    public function lessons()
    {
        return $this->hasManyThrough(Lesson::class, Module::class);
    }
    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }
    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
