<?php

namespace App\Services;

use App\Models\Barbero;
use App\Models\Cita;
use App\Models\CitaServicio;
use App\Models\Servicio;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Aquí vive la lógica de la reserva. El servidor NO confía en el navegador:
// recalcula duración, total, horario y choques por su cuenta.
class CitaService
{
    /**
     * @param array{barbero_id:int,fecha:string,hora_inicio:string,servicios:array<int>} $datos
     */
    public function crear(array $datos, string $origen, string $estado, string $clienteNombre, ?string $clienteTelefono, ?User $usuario = null): Cita
    {
        // Transacción: o se guarda TODO (cita + sus servicios) o no se guarda nada
        return DB::transaction(function () use ($datos, $origen, $estado, $clienteNombre, $clienteTelefono, $usuario) {

            // lockForUpdate "bloquea" la fila del barbero: si dos personas reservan a la vez,
            // la segunda espera y luego ve que el horario ya está ocupado.
            $barbero = Barbero::where('id', $datos['barbero_id'])
                ->where('activo', true)
                ->lockForUpdate()
                ->first();
            if (! $barbero) {
                $this->error('barbero_id', 'Ese barbero no está disponible.');
            }

            $ids = array_values(array_unique($datos['servicios']));
            $servicios = Servicio::whereIn('id', $ids)->where('activo', true)->get();
            if ($servicios->count() !== count($ids)) {
                $this->error('servicios', 'Alguno de los servicios ya no está disponible.');
            }

            // Duración y total salen de la BASE DE DATOS, no del navegador
            $minutos = (int) $servicios->sum('duracion_min');
            $total = (float) $servicios->sum('precio');

            $inicio = Carbon::createFromFormat('Y-m-d H:i', $datos['fecha'].' '.$datos['hora_inicio']);
            $fin = $inicio->copy()->addMinutes($minutos);
            $hi = $inicio->format('H:i');
            $hf = $fin->format('H:i');

            if ($inicio->lte(now())) {
                $this->error('hora_inicio', 'Esa hora ya pasó.');
            }
            // 0 = domingo, igual que getDay() de JavaScript
            if (! in_array($inicio->dayOfWeek, $barbero->dias_trabajo)) {
                $this->error('fecha', $barbero->nombre.' no trabaja ese día.');
            }
            if ($fin->toDateString() !== $inicio->toDateString()
                || $hi < substr($barbero->hora_entrada, 0, 5)
                || $hf > substr($barbero->hora_salida, 0, 5)) {
                $this->error('hora_inicio', 'La cita queda fuera del horario del barbero.');
            }

            // Choque: la nueva empieza antes de que termine la otra Y termina después de que empiece la otra
            $choca = Cita::where('barbero_id', $barbero->id)
                ->whereDate('fecha', $datos['fecha'])
                ->where('estado', '!=', 'cancelada')
                ->where('hora_inicio', '<', $hf.':00')
                ->where('hora_fin', '>', $hi.':00')
                ->exists();
            if ($choca) {
                $this->error('hora_inicio', 'Ese horario acaba de ser ocupado. Elige otro.');
            }

            $cita = Cita::create([
                'user_id' => $usuario?->id,
                'barbero_id' => $barbero->id,
                'cliente_nombre' => $clienteNombre,
                'cliente_telefono' => $clienteTelefono,
                'fecha' => $datos['fecha'],
                'hora_inicio' => $hi.':00',
                'hora_fin' => $hf.':00',
                'estado' => $estado,
                'origen' => $origen,
                'codigo' => $this->codigoUnico(),
                'total' => $total,
            ]);

            foreach ($servicios as $servicio) {
                // Se COPIAN nombre, precio y duración: si mañana cambia el precio, la cita vieja no cambia
                CitaServicio::create([
                    'cita_id' => $cita->id,
                    'servicio_id' => $servicio->id,
                    'nombre' => $servicio->nombre,
                    'precio' => $servicio->precio,
                    'duracion_min' => $servicio->duracion_min,
                ]);
            }

            return $cita->load('servicios');
        });
    }

    private function codigoUnico(): string
    {
        $letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin letras confusas (I, O, 0, 1)
        do {
            $codigo = 'JSF-';
            for ($i = 0; $i < 5; $i++) {
                $codigo .= $letras[random_int(0, strlen($letras) - 1)];
            }
        } while (Cita::where('codigo', $codigo)->exists()); // el índice único es la red de seguridad
        return $codigo;
    }

    private function error(string $campo, string $mensaje): never
    {
        throw ValidationException::withMessages([$campo => [$mensaje]]);
    }
}
