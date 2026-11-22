<?php

namespace App\Support;

use Illuminate\Pagination\LengthAwarePaginator;

class Paginated
{
    public static function meta(LengthAwarePaginator $p): array
    {
        return [
            'current_page' => $p->currentPage(),
            'last_page' => $p->lastPage(),
            'total' => $p->total(),
        ];
    }
}
