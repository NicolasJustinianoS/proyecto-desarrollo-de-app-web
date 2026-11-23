<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CitaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'codigo' => $this->codigo,
            'cliente_nombre' => $this->cliente_nombre,
            'cliente_telefono' => $this->cliente_telefono ?? '',
            'barbero_id' => $this->barbero_id,
            'fecha' => $this->fecha->format('Y-m-d'),
            'hora_inicio' => substr($this->hora_inicio, 0, 5),
            'hora_fin' => substr($this->hora_fin, 0, 5),
            'servicios' => $this->servicios->pluck('nombre')->all(),
            'estado' => $this->estado,
            'origen' => $this->origen,
            'total' => (float) $this->total,
        ];
    }
}
