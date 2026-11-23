<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BarberoResource;
use App\Models\Barbero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BarberoController extends Controller
{
    private function reglas(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:60'],
            'apellido' => ['required', 'string', 'max:60'],
            'rol' => ['required', 'string', 'max:60'],
            'hora_entrada' => ['required', 'date_format:H:i'],
            'hora_salida' => ['required', 'date_format:H:i', 'after:hora_entrada'],
            'dias_trabajo' => ['required', 'array', 'min:1'],
            'dias_trabajo.*' => ['integer', 'between:0,6'],
        ];
    }

    public function index()
    {
        return BarberoResource::collection(Barbero::where('activo', true)->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $barbero = Barbero::create($request->validate($this->reglas()) + ['activo' => true]);
        return (new BarberoResource($barbero))->response()->setStatusCode(201);
    }

    public function update(Request $request, Barbero $barbero): BarberoResource
    {
        $barbero->update($request->validate($this->reglas()));
        return new BarberoResource($barbero->refresh());
    }

    public function destroy(Barbero $barbero): JsonResponse
    {
        $barbero->update(['activo' => false]);
        return response()->json(['message' => 'Barbero desactivado.']);
    }
}
