<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barbero extends Model
{
    protected $table = 'barberos';

    protected $fillable = [
        'nombre', 'apellido', 'rol', 'foto_url',
        'hora_entrada', 'hora_salida', 'dias_trabajo', 'activo',
    ];

    protected function casts(): array
    {
        return [
            'dias_trabajo' => 'array',
            'activo' => 'boolean',
        ];
    }

    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class);
    }
}