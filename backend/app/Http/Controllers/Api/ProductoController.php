<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;

class ProductoController extends Controller
{
    // GET /api/productos: solo los productos activos
    public function index()
    {
        return ProductoResource::collection(
            Producto::where('activo', true)->orderBy('id')->get()
        );
    }
}