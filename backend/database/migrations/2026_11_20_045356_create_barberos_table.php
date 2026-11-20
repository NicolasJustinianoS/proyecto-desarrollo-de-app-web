<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('barberos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellido');
            $table->string('rol')->default('Barbero');
            $table->string('foto_url')->nullable();
            $table->time('hora_entrada')->default('09:00');
            $table->time('hora_salida')->default('19:00');
            $table->json('dias_trabajo');   // [1,2,3,4,5,6]; 0 = domingo
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('barberos');
    }
};
