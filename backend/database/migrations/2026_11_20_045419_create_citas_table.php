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
      Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('barbero_id')->constrained('barberos');
            $table->string('cliente_nombre');
            $table->string('cliente_telefono', 8)->nullable();
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->enum('estado', ['pendiente', 'confirmada', 'completada', 'cancelada'])->default('confirmada');
            $table->enum('origen', ['app', 'whatsapp', 'presencial'])->default('app');
            $table->string('codigo', 12)->unique();
            $table->decimal('total', 8, 2);
            $table->timestamps();

            $table->index(['barbero_id', 'fecha']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
