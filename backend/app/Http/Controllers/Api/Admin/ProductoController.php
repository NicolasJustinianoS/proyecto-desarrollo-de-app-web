<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductoResource;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    private function reglas(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['required', 'string', 'max:500'],
            'precio' => ['required', 'numeric', 'min:1', 'max:9999'],
        ];
    }

    public function index()
    {
        return ProductoResource::collection(Producto::where('activo', true)->orderBy('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $producto = Producto::create($request->validate($this->reglas()) + ['activo' => true]);
        return (new ProductoResource($producto))->response()->setStatusCode(201);
    }

    public function update(Request $request, Producto $producto): ProductoResource
    {
        $producto->update($request->validate($this->reglas()));
        return new ProductoResource($producto);
    }

    public function destroy(Producto $producto): JsonResponse
    {
        $producto->update(['activo' => false]);
        return response()->json(['message' => 'Producto desactivado.']);
    }
}
