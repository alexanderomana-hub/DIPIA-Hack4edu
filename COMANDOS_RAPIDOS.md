# 🚀 Comandos Rápidos para Ejecutar DIPIA

## Opción 1: Ejecutar Todo Automáticamente (Windows)
```bash
# Doble clic en el archivo:
EJECUTAR.bat
```

## Opción 2: Manual (Paso a Paso)

### Terminal 1 - Backend (Python/Flask):
```bash
# Activar entorno virtual
venv\Scripts\activate

# Ejecutar servidor Flask
python app.py
```

### Terminal 2 - Frontend (React/Vite):
```bash
# Desde la raíz del proyecto (donde está package.json)
npm run dev
```

---

## 📍 Estructura del Proyecto

```
DIPIA_MILSET_2025/
├── app.py              ← Backend Flask (ejecutar aquí)
├── package.json        ← Frontend (ejecutar npm run dev desde aquí)
├── index.html          ← HTML principal
├── vite.config.js      ← Configuración Vite
├── venv/               ← Entorno virtual Python
└── src/                ← Código fuente React
```

---

## ✅ Verificación

1. **Backend corriendo**: Verás mensajes como:
   ```
   ✅ Base de datos inicializada
   🚀 Servidor Flask iniciado
   ```

2. **Frontend corriendo**: Verás:
   ```
   VITE v4.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3000/
   ```

3. **Abrir navegador**: Ve a `http://localhost:3000`

---

## 🔧 Si hay errores:

### Error: "npm no se reconoce"
```bash
# Instalar Node.js desde: https://nodejs.org/
```

### Error: "python no se reconoce"
```bash
# Activar venv primero:
venv\Scripts\activate
```

### Error: "Module not found"
```bash
# Backend:
pip install -r requirements.txt

# Frontend:
npm install
```

---

## 🎯 Orden Correcto:

1. ✅ `venv\Scripts\activate` (Terminal 1)
2. ✅ `python app.py` (Terminal 1)
3. ✅ `npm run dev` (Terminal 2 - desde la raíz)
4. ✅ Abrir navegador en `http://localhost:3000`


