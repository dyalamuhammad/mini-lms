<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $guarded = [];
    protected $casts = ['deadline' => 'datetime'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
    public function submissions()
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
