<?php

use App\Http\Controllers\Api\BarberoController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ServicioController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Ruta que trae Sanctum: devuelve al usuario autenticado
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Catálogo público (solo lectura)
Route::get('/servicios', [ServicioController::class, 'index']);
Route::get('/barberos', [BarberoController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);