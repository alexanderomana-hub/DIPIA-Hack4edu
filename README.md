# DIPIA - Detección de Patologías en Infraestructura con IA

## Descripción del Proyecto

DIPIA es una aplicación web que utiliza inteligencia artificial para detectar automáticamente patologías en infraestructura civil, como grietas, humedad, desconchados, oxidación y fisuras en imágenes de estructuras.

## Características Principales

- **API REST** construida con Flask
- **Modelo de IA** basado en PyTorch para detección de objetos
- **Procesamiento de imágenes** en tiempo real
- **Detección múltiple** de tipos de patologías
- **Respuesta JSON** estructurada con coordenadas y confianza

## Instalación

### Prerrequisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd DIPIA_MILSET_2025
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   ```

3. **Activar entorno virtual**
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```
   
   **Linux/Mac:**
   ```bash
   source venv/bin/activate
   ```

4. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

5. **Colocar el modelo de IA**
   - Descargar el archivo `best.pt` del modelo entrenado
   - Colocarlo en la raíz del proyecto (mismo directorio que `app.py`)

## Uso

### Iniciar la Aplicación

```bash
python app.py
```

La aplicación estará disponible en: `http://localhost:5000`

### Endpoints Disponibles

#### 1. **GET /** - Información de la API
```bash
curl http://localhost:5000/
```

#### 2. **GET /health** - Estado de la aplicación
```bash
curl http://localhost:5000/health
```

#### 3. **POST /analyze** - Analizar imagen
```bash
curl -X POST -F "image=@ruta/a/tu/imagen.jpg" http://localhost:5000/analyze
```

### Ejemplo de Uso con Python

```python
import requests

# URL de la API
url = "http://localhost:5000/analyze"

# Abrir y enviar imagen
with open("imagen_ejemplo.jpg", "rb") as f:
    files = {"image": f}
    response = requests.post(url, files=files)

# Procesar respuesta
if response.status_code == 200:
    data = response.json()
    print(f"Detecciones encontradas: {data['total_detections']}")
    
    for detection in data['detections']:
        print(f"Tipo: {detection['label']}")
        print(f"Confianza: {detection['confidence']:.2f}")
        print(f"Coordenadas: {detection['box']}")
        print("---")
else:
    print(f"Error: {response.json()}")
```

## Formato de Respuesta

La API devuelve un JSON con la siguiente estructura:

```json
{
  "success": true,
  "detections": [
    {
      "box": [x1, y1, x2, y2],
      "label": "Grieta",
      "confidence": 0.85
    }
  ],
  "total_detections": 1,
  "image_info": {
    "original_width": 1920,
    "original_height": 1080
  }
}
```

### Campos de Respuesta

- **success**: `boolean` - Indica si la operación fue exitosa
- **detections**: `array` - Lista de detecciones encontradas
  - **box**: `[x1, y1, x2, y2]` - Coordenadas del rectángulo de detección
  - **label**: `string` - Tipo de patología detectada
  - **confidence**: `float` - Nivel de confianza (0.0 a 1.0)
- **total_detections**: `integer` - Número total de detecciones
- **image_info**: `object` - Información de la imagen original

## Tipos de Patologías Detectadas

- **Grieta**: Fisuras lineales en la superficie
- **Humedad**: Manchas o áreas húmedas
- **Desconchado**: Pérdida de material superficial
- **Oxidación**: Corrosión en elementos metálicos
- **Fisura**: Aberturas más pequeñas que grietas

## Configuración

### Archivo `config.py`

```python
class Config:
    VIDEO_SOURCE = 0  # Fuente de cámara (0 = webcam principal)
```

### Variables de Entorno

- `FLASK_ENV`: Modo de desarrollo (`development` o `production`)
- `FLASK_DEBUG`: Activar/desactivar modo debug (`True` o `False`)

## Estructura del Proyecto

```
DIPIA_MILSET_2025/
├── app.py                 # Aplicación principal Flask
├── config.py             # Configuración del proyecto
├── requirements.txt      # Dependencias de Python
├── best.pt              # Modelo de IA (debe ser proporcionado)
├── uploads/             # Directorio temporal para imágenes
├── static/              # Archivos estáticos
│   ├── style.css
│   └── templates/
│       └── index.html
└── venv/                # Entorno virtual
```

## Solución de Problemas

### Error: "Modelo no encontrado"
- Verificar que el archivo `best.pt` esté en la raíz del proyecto
- Verificar permisos de lectura del archivo

### Error: "Archivo demasiado grande"
- La imagen debe ser menor a 16MB
- Redimensionar la imagen antes de enviarla

### Error: "Tipo de archivo no permitido"
- Usar formatos: PNG, JPG, JPEG, GIF, BMP, TIFF
- Verificar la extensión del archivo

## Desarrollo

### Agregar Nuevos Tipos de Patologías

1. Entrenar el modelo con las nuevas clases
2. Actualizar el diccionario `class_labels` en `app.py`
3. Reentrenar y actualizar `best.pt`

### Mejorar la Precisión

1. Aumentar el conjunto de datos de entrenamiento
2. Ajustar hiperparámetros del modelo
3. Implementar técnicas de data augmentation

## Contribuciones

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## Contacto

- **Proyecto**: DIPIA - MILSET 2025
- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]

---

**Nota**: Este proyecto es parte de la competencia MILSET 2025 y está diseñado para demostrar el uso de IA en la detección de patologías en infraestructura civil.
