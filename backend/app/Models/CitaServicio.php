<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CitaServicio extends Model
{
    protected $table = 'cita_servicio';

    protected $fillable = ['cita_id', 'servicio_id', 'nombre', 'precio', 'duracion_min'];

    protected function casts(): array
    {
        return ['precio' => 'float'];
    }

    public function cita(): BelongsTo
    {
        return $this->belongsTo(Cita::class);
    }

    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class);
    }
}