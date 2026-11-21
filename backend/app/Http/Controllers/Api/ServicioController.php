<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServicioResource;
use App\Models\Servicio;

class ServicioController extends Controller
{
    // GET /api/servicios: solo los servicios activos
    public function index()
    {
        return ServicioResource::collection(
            Servicio::where('activo', true)->orderBy('id')->get()
        );
    }
}