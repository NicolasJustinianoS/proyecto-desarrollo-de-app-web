<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BarberoResource;
use App\Models\Barbero;

class BarberoController extends Controller
{
    // GET /api/barberos: solo los barberos activos
    public function index()
    {
        return BarberoResource::collection(
            Barbero::where('activo', true)->orderBy('id')->get()
        );
    }
}