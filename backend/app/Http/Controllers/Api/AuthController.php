<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // POST /api/registro: crea un cliente. El rol NO viene del navegador: siempre es "cliente".
    public function registro(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:60'],
            'apellido' => ['required', 'string', 'max:60'],
            'email' => ['required', 'email', 'max:120', 'unique:users,email'],
            'telefono' => ['required', 'digits:8'],
            'password' => ['required', 'string', 'min:8', 'max:100', 'confirmed'],
        ], [
            'email.unique' => 'Ya existe una cuenta con ese correo.',
            'telefono.digits' => 'El teléfono debe tener 8 dígitos.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
        ]);

        // $fillable no incluye "rol", así que nadie puede registrarse como admin
        $usuario = User::create($datos);

        return $this->respuestaConToken($usuario, 201);
    }

    // POST /api/login
    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $usuario = User::where('email', $datos['email'])->first();

        // Mismo mensaje si falla el correo o la clave: no revela cuál de los dos existe
        if (! $usuario || ! Hash::check($datos['password'], $usuario->password)) {
            throw ValidationException::withMessages([
                'email' => ['Correo o contraseña incorrectos.'],
            ]);
        }

        return $this->respuestaConToken($usuario);
    }

    // POST /api/logout: borra SOLO el token con el que se hizo la petición
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    // GET /api/user
    public function yo(Request $request): JsonResponse
    {
        return response()->json($this->datosPublicos($request->user()));
    }

    private function respuestaConToken(User $usuario, int $estado = 200): JsonResponse
    {
        return response()->json([
            'token' => $usuario->createToken('web')->plainTextToken,
            'user' => $this->datosPublicos($usuario),
        ], $estado);
    }

    // Nunca se devuelve el hash de la contraseña
    private function datosPublicos(User $u): array
    {
        return [
            'id' => $u->id,
            'nombre' => $u->nombre,
            'apellido' => $u->apellido,
            'email' => $u->email,
            'telefono' => $u->telefono,
            'rol' => $u->rol,
        ];
    }
}
