<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarberoController;
use App\Http\Controllers\Api\CitaController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ServicioController;
use Illuminate\Support\Facades\Route;

// ----- Públicas -----
Route::get('/servicios', [ServicioController::class, 'index']);
Route::get('/barberos', [BarberoController::class, 'index']);
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/citas/ocupadas', [CitaController::class, 'ocupadas'])->middleware('throttle:60,1');

// Registro e ingreso con límite de intentos (frena adivinar contraseñas)
Route::post('/registro', [AuthController::class, 'registro'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// ----- Con sesión (token Sanctum) -----
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'yo']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/citas', [CitaController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/mis-citas', [CitaController::class, 'misCitas']);

    // ----- Solo administrador -----
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/citas', [Admin\CitaController::class, 'index']);
        Route::post('/citas', [Admin\CitaController::class, 'store']);
        Route::patch('/citas/{cita}', [Admin\CitaController::class, 'update']);
        Route::delete('/citas/{cita}', [Admin\CitaController::class, 'destroy']);

        Route::get('/servicios', [Admin\ServicioController::class, 'index']);
        Route::post('/servicios', [Admin\ServicioController::class, 'store']);
        Route::put('/servicios/{servicio}', [Admin\ServicioController::class, 'update']);
        Route::delete('/servicios/{servicio}', [Admin\ServicioController::class, 'destroy']);

        Route::get('/productos', [Admin\ProductoController::class, 'index']);
        Route::post('/productos', [Admin\ProductoController::class, 'store']);
        Route::put('/productos/{producto}', [Admin\ProductoController::class, 'update']);
        Route::delete('/productos/{producto}', [Admin\ProductoController::class, 'destroy']);

        Route::get('/barberos', [Admin\BarberoController::class, 'index']);
        Route::post('/barberos', [Admin\BarberoController::class, 'store']);
        Route::put('/barberos/{barbero}', [Admin\BarberoController::class, 'update']);
        Route::delete('/barberos/{barbero}', [Admin\BarberoController::class, 'destroy']);
    });
});
