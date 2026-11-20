<?php

namespace Database\Seeders;

use App\Models\Barbero;
use App\Models\Producto;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Administrador: correo y contraseña salen del .env, nunca del código
        $password = env('ADMIN_PASSWORD') ?: Str::random(14);

        // forceCreate permite asignar "rol", que no está en $fillable a propósito.
        // La contraseña se guarda cifrada (hash) por el cast "hashed" del modelo.
        User::forceCreate([
            'nombre' => 'Administrador',
            'apellido' => 'Joseff Studio',
            'email' => env('ADMIN_EMAIL', 'admin@joseffstudio.test'),
            'password' => $password,
            'rol' => 'admin',
        ]);

        if (! env('ADMIN_PASSWORD')) {
            $this->command->warn('ADMIN_PASSWORD vacío. Contraseña generada: ' . $password);
        }

        $servicios = [
            ['nombre' => 'Corte de pelo', 'descripcion' => 'Corte personalizado según estilo, ocasión y tipo de cabello.', 'precio' => 80, 'duracion_min' => 30],
            ['nombre' => 'Barba', 'descripcion' => 'Arreglo y perfilado de barba con navaja y toalla caliente.', 'precio' => 40, 'duracion_min' => 25],
            ['nombre' => 'Cejas', 'descripcion' => 'Perfilado y diseño de cejas para un look más definido.', 'precio' => 20, 'duracion_min' => 15],
            ['nombre' => 'Tintado de pelo', 'descripcion' => 'Coloración profesional con productos de alta calidad.', 'precio' => 100, 'duracion_min' => 60],
            ['nombre' => 'Masaje de cara', 'descripcion' => 'Masaje facial relajante y revitalizante para tu piel.', 'precio' => 110, 'duracion_min' => 40],
            ['nombre' => 'Exfoliación de cara', 'descripcion' => 'Limpieza profunda y exfoliación para una piel renovada.', 'precio' => 70, 'duracion_min' => 35],
        ];
        foreach ($servicios as $servicio) {
            Servicio::create($servicio);
        }

        $productos = [
            ['nombre' => 'Shampoo de pepino', 'descripcion' => 'Limpieza suave y frescura para el cabello.', 'precio' => 100],
            ['nombre' => 'Cera para pelo L3bel', 'descripcion' => 'Fijación y acabado natural para tu peinado.', 'precio' => 150],
            ['nombre' => 'Talco texturizante', 'descripcion' => 'Volumen y textura con acabado mate.', 'precio' => 100],
        ];
        foreach ($productos as $producto) {
            Producto::create($producto);
        }

        $barberos = [
            ['nombre' => 'Joseff', 'apellido' => 'Justiniano', 'rol' => 'Barbero principal', 'hora_entrada' => '09:00', 'hora_salida' => '19:00', 'dias_trabajo' => [1, 2, 3, 4, 5, 6]],
            ['nombre' => 'Alejandro', 'apellido' => 'Tineo', 'rol' => 'Barbero', 'hora_entrada' => '09:00', 'hora_salida' => '19:00', 'dias_trabajo' => [1, 2, 3, 4, 5, 6]],
            ['nombre' => 'Walter', 'apellido' => 'Chavez', 'rol' => 'Barbero', 'hora_entrada' => '10:00', 'hora_salida' => '19:00', 'dias_trabajo' => [1, 2, 3, 4, 5, 6]],
        ];
        foreach ($barberos as $barbero) {
            Barbero::create($barbero);
        }
    }
}