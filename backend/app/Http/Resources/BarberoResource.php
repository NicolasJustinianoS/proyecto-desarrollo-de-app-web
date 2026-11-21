<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BarberoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'rol' => $this->rol,
            'foto_url' => $this->foto_url,
            // MySQL devuelve "09:00:00"; nuestro frontend usa "09:00"
            'hora_entrada' => substr($this->hora_entrada, 0, 5),
            'hora_salida' => substr($this->hora_salida, 0, 5),
            'dias_trabajo' => $this->dias_trabajo,
        ];
    }
}