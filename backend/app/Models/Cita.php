<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cita extends Model
{
    protected $table = 'citas';

    protected $fillable = [
        'user_id', 'barbero_id', 'cliente_nombre', 'cliente_telefono',
        'fecha', 'hora_inicio', 'hora_fin', 'estado', 'origen', 'codigo', 'total',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date:Y-m-d',
            'total' => 'float',
        ];
    }

    public function barbero(): BelongsTo
    {
        return $this->belongsTo(Barbero::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function servicios(): HasMany
    {
        return $this->hasMany(CitaServicio::class);
    }
}