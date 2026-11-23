<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CitaResource;
use App\Models\Cita;
use App\Services\CitaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitaController extends Controller
{
    // GET /api/admin/citas?fecha=YYYY-MM-DD
    public function index(Request $request)
    {
        $datos = $request->validate([
            'fecha' => ['required', 'date_format:Y-m-d'],
        ]);

        return CitaResource::collection(
            Cita::with('servicios')
                ->whereDate('fecha', $datos['fecha'])
                ->orderBy('hora_inicio')
                ->get()
        );
    }

    // POST /api/admin/citas: alta de citas de WhatsApp o presenciales
    public function store(Request $request, CitaService $servicio): JsonResponse
    {
        $datos = $request->validate([
            'origen' => ['required', 'in:whatsapp,presencial'],
            'estado' => ['required', 'in:pendiente,confirmada,completada,cancelada'],
            'cliente_nombre' => ['nullable', 'string', 'max:120', 'required_if:origen,whatsapp'],
            'cliente_telefono' => ['nullable', 'digits:8', 'required_if:origen,whatsapp'],
            'barbero_id' => ['required', 'integer'],
            'fecha' => ['required', 'date_format:Y-m-d'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'servicios' => ['required', 'array', 'min:1', 'max:6'],
            'servicios.*' => ['integer'],
        ]);

        $cita = $servicio->crear(
            $datos,
            $datos['origen'],
            $datos['estado'],
            $datos['cliente_nombre'] ?? 'Sin registro',
            $datos['cliente_telefono'] ?? null
        );

        return (new CitaResource($cita))->response()->setStatusCode(201);
    }

    // PATCH /api/admin/citas/{cita}: cambiar el estado
    public function update(Request $request, Cita $cita): CitaResource
    {
        $datos = $request->validate([
            'estado' => ['required', 'in:pendiente,confirmada,completada,cancelada'],
        ]);

        $cita->update($datos);

        return new CitaResource($cita->load('servicios'));
    }

    // DELETE /api/admin/citas/{cita}
    public function destroy(Cita $cita): JsonResponse
    {
        $cita->delete(); // sus filas de cita_servicio caen en cascada
        return response()->json(['message' => 'Cita eliminada.']);
    }
}
