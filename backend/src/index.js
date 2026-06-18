import app from './app.js';
import { supabaseAdmin } from './lib/supabase.js';

const PORT = process.env.PORT || 3001;

async function seedDatabase() {
  try {
    // 1. Verificar/sembrar profesores
    const { data: instructors, error } = await supabaseAdmin
      .from('instructors')
      .select('id, name');
    
    if (error) {
      console.warn('⚠️ No se pudieron consultar los profesores (¿Base de datos desconectada?):', error.message);
      return;
    }

    if (!instructors || instructors.length === 0) {
      console.log('🌱 Base de datos sin profesores. Sembrando Lucas y Martín...');
      const { error: insertError } = await supabaseAdmin
        .from('instructors')
        .insert([
          { name: 'Lucas', bio: 'Entrenador principal y especialista en Boxeo/Funcional' },
          { name: 'Martín', bio: 'Preparador físico y especialista en Fuerza' }
        ]);
      if (insertError) throw insertError;
      console.log('✅ Profesores sembrados con éxito.');
    }

    // 2. Verificar/sembrar actividad por defecto
    const { data: activities, error: actError } = await supabaseAdmin
      .from('activity_types')
      .select('id');
    
    if (actError) {
      console.warn('⚠️ No se pudieron consultar las actividades:', actError.message);
    } else if (!activities || activities.length === 0) {
      console.log('🌱 Base de datos sin actividades. Sembrando actividad por defecto...');
      const { error: insertActError } = await supabaseAdmin
        .from('activity_types')
        .insert([
          { name: 'Entrenamiento', color: '#ef4444', icon: 'dumbbell', duration_minutes: 60 }
        ]);
      if (insertActError) throw insertActError;
      console.log('✅ Actividad por defecto sembrada.');
    }
  } catch (err) {
    console.error('❌ Error al sembrar base de datos:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`🥊 Quamtium API corriendo en puerto ${PORT}`);
  seedDatabase();
});
