<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CitaResource;
use App\Models\Cita;
use App\Services\CitaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitaController extends Controller
{
    // GET /api/citas/ocupadas?barbero_id=1&fecha=2026-11-25   (público)
    // Devuelve SOLO horas: sin nombres ni teléfonos de otros clientes.
    public function ocupadas(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'barbero_id' => ['required', 'integer', 'exists:barberos,id'],
            'fecha' => ['required', 'date_format:Y-m-d'],
        ]);

        $lista = Cita::where('barbero_id', $datos['barbero_id'])
            ->whereDate('fecha', $datos['fecha'])
            ->where('estado', '!=', 'cancelada')
            ->orderBy('hora_inicio')
            ->get(['hora_inicio', 'hora_fin'])
            ->map(fn ($c) => [
                'hora_inicio' => substr($c->hora_inicio, 0, 5),
                'hora_fin' => substr($c->hora_fin, 0, 5),
            ]);

        return response()->json($lista);
    }

    // POST /api/citas   (cliente con sesión)
    public function store(Request $request, CitaService $servicio): JsonResponse
    {
        $datos = $request->validate([
            'barbero_id' => ['required', 'integer'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'servicios' => ['required', 'array', 'min:1', 'max:6'],
            'servicios.*' => ['integer'],
        ]);

        $usuario = $request->user();

        $cita = $servicio->crear(
            $datos,
            'app',
            'confirmada',
            trim($usuario->nombre.' '.$usuario->apellido),
            $usuario->telefono,
            $usuario
        );

        return (new CitaResource($cita))->response()->setStatusCode(201);
    }

    // GET /api/mis-citas   (IDOR: el usuario sale del TOKEN, no de la URL)
    public function misCitas(Request $request)
    {
        return CitaResource::collection(
            Cita::with('servicios')
                ->where('user_id', $request->user()->id)
                ->orderByDesc('fecha')
                ->orderByDesc('hora_inicio')
                ->get()
        );
    }
}
