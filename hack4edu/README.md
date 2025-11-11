# DIPIA Evolution for Hack4edu
## Tutor Virtual de Patologías Estructurales

### 🎯 Objetivo
Evolucionar DIPIA de un detector profesional a un **Tutor Virtual de Patologías Estructurales** para democratizar el conocimiento de diagnóstico para ingenieros aprendices en entornos vulnerables.

### 🏗️ Arquitectura de Doble-IA

#### Backend Extendido (`hack4edu/backend/`)
- **IA N°1**: Detector existente (master_model.pt) - Detecta Crack, Humidity, Person
- **IA N°2**: Clasificador de características (pendiente) - Clasifica tipos específicos de daños
- **Sistema de Recorte**: Recorta bounding boxes para análisis detallado
- **API Extendida**: `/analyze_extended` - Retorna resultados de ambas IAs

#### Frontend Interactivo (`hack4edu/frontend/`)
- **Panel de 4 Pestañas**:
  1. **Datos Crudos**: Salida de IA N°1 (confianza, coordenadas)
  2. **Clasificación**: Salida de IA N°2 (análisis morfológico)
  3. **Base de Conocimiento**: Lecciones educativas dinámicas
  4. **Plan de Acción**: Reto interactivo de 3 pasos

### 🧠 Base de Conocimiento (`hack4edu/knowledge/`)
- **Diccionario Técnico**: Autocorrector con terminología profesional
- **Conocimiento de Daños**: Definiciones, causas, soluciones por tipo
- **Contenido Multimedia**: Videos y imágenes educativas

### 🌍 Internacionalización (`hack4edu/frontend/i18n/`)
- **3 Idiomas**: Español, Inglés, Portugués
- **Traducciones Completas**: UI y contenido educativo
- **Selector de Idioma**: Interfaz intuitiva

### 📋 Funcionalidades Implementadas

#### ✅ Completadas
- [x] Análisis de estructura actual
- [x] Panel de análisis interactivo con 4 pestañas
- [x] Sistema de internacionalización (i18n)
- [x] Base de conocimiento de daños
- [x] Diccionario técnico multilingüe
- [x] Backend extendido con doble-IA (estructura)

#### 🚧 En Progreso
- [ ] IA N°2 (Clasificador de características)
- [ ] Editor de texto con autocorrector técnico
- [ ] Generador de reportes PDF

#### 📝 Pendientes
- [ ] Integración completa con frontend existente
- [ ] Testing y optimización
- [ ] Documentación técnica

### 🚀 Cómo Usar

#### 1. Backend Extendido
```bash
cd hack4edu/backend
python app_extended.py
# Servidor en puerto 5001
```

#### 2. Frontend Extendido
```bash
cd hack4edu/frontend
# Integrar con React existente
```

#### 3. Base de Conocimiento
- Archivos JSON con contenido educativo
- Diccionario técnico para autocorrector
- Traducciones en 3 idiomas

### 🎓 El Reto Interactivo

#### Paso 1: Triaje (Prioridad)
- Alto, Medio, Bajo
- Feedback instantáneo

#### Paso 2: Plan de Investigación
- Revisar planos vs. Reparar ya vs. Consultar especialista
- Simula proceso mental del ingeniero

#### Paso 3: Concepto de Solución
- Estructural vs. Cosmética vs. Preventiva
- Desarrolla criterio técnico

### 📊 Generador de Reportes
- **Mapa de Prioridades**: Pines de colores por severidad
- **Fichas de Acción**: Instrucciones claras para jefe de obra
- **Fotos Contextuales**: Imagen general + detalles
- **PDF Profesional**: Listo para campo

### 🔧 Tecnologías
- **Backend**: Flask, OpenCV, YOLO, Ultralytics
- **Frontend**: React, CSS3, i18n
- **IA**: YOLOv8, Modelos personalizados
- **PDF**: jsPDF, Canvas
- **Base de Datos**: SQLite

### 📁 Estructura de Archivos
```
hack4edu/
├── backend/
│   └── app_extended.py          # Backend con doble-IA
├── frontend/
│   ├── ImageAnalysisExtended.jsx # Componente principal
│   ├── ImageAnalysisExtended.css # Estilos
│   ├── components/
│   │   └── LanguageSelector.jsx  # Selector de idioma
│   ├── hooks/
│   │   └── useTranslation.js     # Hook i18n
│   └── i18n/
│       └── translations.json     # Traducciones
├── knowledge/
│   ├── technical_dictionary.json # Diccionario técnico
│   └── damage_knowledge.json     # Base de conocimiento
└── README.md
```

### 🎯 Próximos Pasos
1. **Completar IA N°2** - Clasificador de características
2. **Implementar autocorrector** - Editor de texto inteligente
3. **Desarrollar generador PDF** - Reportes de campo
4. **Integración completa** - Con sistema existente
5. **Testing y optimización** - Preparación para hackatón

### 🏆 Valor para Hack4edu
- **Democratización**: Conocimiento técnico accesible
- **Educación**: Tutor virtual interactivo
- **Práctica**: Simulación de casos reales
- **Impacto Social**: Ingenieros en entornos vulnerables
- **Innovación**: Doble-IA + Gamificación

---

**Desarrollado para Hack4edu 2025** 🚀
*Tutor Virtual de Patologías Estructurales*

