<?php

use App\Http\Middleware\EsAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Nombre corto para usar en las rutas: ->middleware('admin')
        $middleware->alias([
            'admin' => EsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Las rutas /api/* siempre responden JSON (nunca una página de error HTML)
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
