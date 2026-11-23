<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServicioResource;
use App\Models\Servicio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    private function reglas(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['required', 'string', 'max:500'],
            'precio' => ['required', 'numeric', 'min:1', 'max:9999'],
            'duracion_min' => ['required', 'integer', 'min:5', 'max:480'],
        ];
    }

    public function index()
    {
        return ServicioResource::collection(Servicio::where('activo', true)->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $servicio = Servicio::create($request->validate($this->reglas()) + ['activo' => true]);
        return (new ServicioResource($servicio))->response()->setStatusCode(201);
    }

    public function update(Request $request, Servicio $servicio): ServicioResource
    {
        $servicio->update($request->validate($this->reglas()));
        return new ServicioResource($servicio);
    }

    // No se borra: se desactiva, para no romper el historial de citas
    public function destroy(Servicio $servicio): JsonResponse
    {
        $servicio->update(['activo' => false]);
        return response()->json(['message' => 'Servicio desactivado.']);
    }
}
