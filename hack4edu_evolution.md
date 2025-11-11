# DIPIA Evolution for Hack4edu
## Tutor Virtual de Patologías Estructurales

### Estructura Actual (Preservada)
- ✅ Backend Flask funcionando
- ✅ Frontend React funcionando  
- ✅ IA Detector (YOLO) funcionando
- ✅ Bounding boxes implementados
- ✅ Base de datos SQLite

### Nuevas Funcionalidades a Implementar

#### A. Arquitectura de Doble-IA (Backend)
- [ ] IA N°1: Detector existente (master_model.pt)
- [ ] Sistema de recorte de bounding boxes
- [ ] IA N°2: Clasificador de características (nuevo modelo)
- [ ] API /analyze modificada para doble análisis

#### B. Panel de Análisis Interactivo (Frontend)
- [ ] Pestaña 1: Datos Crudos (IA N°1)
- [ ] Pestaña 2: Clasificación (IA N°2)
- [ ] Pestaña 3: Base de Conocimiento
- [ ] Pestaña 4: Plan de Acción (Reto interactivo)

#### C. Editor de Texto con Autocorrector
- [ ] Editor enriquecido en Pestaña 4
- [ ] Diccionario técnico personalizado
- [ ] Sugerencias de terminología profesional

#### D. Generador de Reportes PDF
- [ ] Botón "Generar Reporte de Campo"
- [ ] Mapa de prioridades visual
- [ ] Fichas de acción por daño crítico

#### E. Internacionalización (i18n)
- [ ] Botón cambio idioma (ES/EN/PT)
- [ ] Archivos de traducción JSON
- [ ] Contenido educativo traducido

### Archivos a Crear/Modificar
- `hack4edu/` - Nueva carpeta para evolución
- `hack4edu/backend/` - Backend extendido
- `hack4edu/frontend/` - Frontend extendido
- `hack4edu/models/` - Modelos de IA adicionales
- `hack4edu/knowledge/` - Base de conocimiento
