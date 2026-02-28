# 📋 Instrucciones para Ejecutar DIPIA

## Requisitos Previos
- Python 3.8 o superior
- Node.js 16 o superior
- npm o yarn

---

## 🚀 Pasos para Ejecutar

### 1️⃣ **Activar el Entorno Virtual de Python**

```bash
# En Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# O en Windows (CMD)
venv\Scripts\activate

# En Linux/Mac
source venv/bin/activate
```

### 2️⃣ **Instalar Dependencias de Python (si no están instaladas)**

```bash
pip install -r requirements.txt
```

### 3️⃣ **Iniciar el Backend (Flask)**

```bash
python app.py
```

El servidor Flask se iniciará en: **http://127.0.0.1:5000**

Deberías ver mensajes como:
```
✅ Base de datos inicializada
🚀 Servidor Flask iniciado
📊 Solo funciones de web (registro, login, materiales)
🖼️ Análisis de imágenes con IA disponible
```

### 4️⃣ **Abrir una Nueva Terminal** (mantén la anterior corriendo)

### 5️⃣ **Instalar Dependencias de Node.js (si no están instaladas)**

```bash
npm install
```

### 6️⃣ **Iniciar el Frontend (React/Vite)**

```bash
npm run dev
```

El frontend se iniciará en: **http://localhost:5173** (o el puerto que Vite asigne)

---

## ✅ Verificación

1. **Backend corriendo**: Deberías ver mensajes de Flask en la terminal
2. **Frontend corriendo**: Deberías ver la URL del servidor de desarrollo (ej: `http://localhost:5173`)
3. **Abrir navegador**: Ve a la URL del frontend (ej: `http://localhost:5173`)

---

## 🔧 Solución de Problemas

### Error: "Module not found" en Python
```bash
pip install -r requirements.txt
```

### Error: "Port 5000 already in use"
- Cierra otros programas que usen el puerto 5000
- O cambia el puerto en `app.py` (línea final): `app.run(debug=True, host='127.0.0.1', port=5001)`

### Error: "Port 5173 already in use"
- Vite automáticamente usará otro puerto (5174, 5175, etc.)
- Revisa la terminal para ver qué puerto está usando

### Error: "npm command not found"
- Instala Node.js desde: https://nodejs.org/

### Error: "venv not found"
- Crea el entorno virtual:
```bash
python -m venv venv
```

---

## 📝 Notas Importantes

- **Mantén ambas terminales abiertas** mientras uses la aplicación
- El backend (Flask) debe estar corriendo antes de usar funciones que requieran el servidor
- La base de datos SQLite (`dipia.db`) se crea automáticamente la primera vez que ejecutas el backend
- Si cambias código del backend, reinicia Flask (Ctrl+C y vuelve a ejecutar `python app.py`)
- Si cambias código del frontend, Vite recarga automáticamente

---

## 🎯 Orden de Ejecución Recomendado

1. ✅ Activar venv
2. ✅ Ejecutar `python app.py` (Terminal 1)
3. ✅ Ejecutar `npm run dev` (Terminal 2)
4. ✅ Abrir navegador en la URL del frontend

---

## 🔄 Detener el Programa

- **Backend**: Presiona `Ctrl+C` en la terminal de Flask
- **Frontend**: Presiona `Ctrl+C` en la terminal de Vite
- **Desactivar venv**: Escribe `deactivate` en la terminal

