<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Deja pasar solo a usuarios con rol "admin". Se usa DESPUÉS de auth:sanctum.
class EsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $usuario = $request->user();

        if (! $usuario || ! $usuario->esAdmin()) {
            return response()->json(['message' => 'Acceso restringido.'], 403);
        }

        return $next($request);
    }
}
