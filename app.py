from flask import Flask, render_template, request, jsonify, Response, session
from flask_cors import CORS
import sqlite3
import time
import hashlib
import os

app = Flask(__name__)
CORS(app)
app.secret_key = 'dipia_secret_key_2025'  # Necesario para sessions

# Configuración
DATABASE = 'dipia.db'

# Variable global para almacenar detecciones (solo para recibir de la app de escritorio)
latest_detections = None

def init_database():
    """Inicializar la base de datos"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Crear tabla de usuarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Verificar si la columna full_name existe, si no, agregarla
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'full_name' not in columns:
        print("Agregando columna full_name a la tabla users...")
        cursor.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
    
    # Verificar si la tabla materials existe y tiene las columnas correctas
    try:
        cursor.execute("PRAGMA table_info(materials)")
        material_columns = [column[1] for column in cursor.fetchall()]
    except:
        material_columns = []
    
    print(f"🔍 Columnas actuales en materials: {material_columns}")
    
    # Si la tabla no existe, la creamos con todas las columnas
    if not material_columns:
        print("🔄 Creando tabla materials con todas las columnas...")
        cursor.execute('''
            CREATE TABLE materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                supplier TEXT NOT NULL,
                price REAL NOT NULL,
                unit TEXT NOT NULL,
                category TEXT DEFAULT 'General',
                pathology_related TEXT DEFAULT '',
                image_url TEXT DEFAULT '',
                is_favorite INTEGER DEFAULT 0,
                usage_count INTEGER DEFAULT 0,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        print("✅ Tabla materials creada con todas las columnas")
    else:
        # Si existe, agregar columnas nuevas si no existen
        if 'category' not in material_columns:
            print("➕ Agregando columna category...")
            cursor.execute("ALTER TABLE materials ADD COLUMN category TEXT DEFAULT 'General'")
        if 'pathology_related' not in material_columns:
            print("➕ Agregando columna pathology_related...")
            cursor.execute("ALTER TABLE materials ADD COLUMN pathology_related TEXT DEFAULT ''")
        if 'image_url' not in material_columns:
            print("➕ Agregando columna image_url...")
            cursor.execute("ALTER TABLE materials ADD COLUMN image_url TEXT DEFAULT ''")
        if 'is_favorite' not in material_columns:
            print("➕ Agregando columna is_favorite...")
            cursor.execute("ALTER TABLE materials ADD COLUMN is_favorite INTEGER DEFAULT 0")
        if 'usage_count' not in material_columns:
            print("➕ Agregando columna usage_count...")
            cursor.execute("ALTER TABLE materials ADD COLUMN usage_count INTEGER DEFAULT 0")
    
    conn.commit()
    conn.close()
    print("✅ Base de datos inicializada")

def hash_password(password):
    """Hashear contraseña"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    """Verificar contraseña"""
    return hash_password(password) == password_hash

# Rutas de la API
@app.route('/')
def home():
    """Página principal"""
    user_id = session.get('user_id')
    return jsonify({
        "message": "DIPIA - Sistema de Diagnóstico de Patologías",
        "version": "1.0",
        "user_id": user_id,
        "features": [
            "Detección de patologías con IA",
            "Gestión de materiales",
            "Análisis de imágenes",
            "Cámara en tiempo real"
        ]
    })

@app.route('/health')
def health():
    """Endpoint de salud"""
    return jsonify({
        "status": "ok",
        "timestamp": time.time(),
        "message": "Servidor Flask funcionando correctamente"
    })

@app.route('/register', methods=['POST'])
def register():
    """Registrar nuevo usuario"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        
        if not all([username, email, password, full_name]):
            return jsonify({"success": False, "error": "Todos los campos son requeridos"}), 400
        
        # Verificar si el usuario ya existe
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM users WHERE username = ? OR email = ?", (username, email))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "error": "Usuario o email ya existe"}), 400
        
        # Crear usuario
        password_hash = hash_password(password)
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, full_name)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Usuario registrado exitosamente"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    """Iniciar sesión"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"success": False, "error": "Username y password son requeridos"}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, password_hash FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        
        if user and verify_password(password, user[1]):
            session['user_id'] = user[0]
            conn.close()
            return jsonify({"success": True, "message": "Login exitoso"})
        else:
            conn.close()
            return jsonify({"success": False, "error": "Credenciales inválidas"}), 401
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    """Cerrar sesión"""
    session.pop('user_id', None)
    return jsonify({"success": True, "message": "Sesión cerrada"})

@app.route('/materials', methods=['GET'])
def get_materials():
    """Obtener materiales del usuario"""
    user_id = session.get('user_id')
    print(f"🔍 GET /materials - User ID: {user_id}")
    
    if not user_id:
        print("❌ Usuario no autenticado")
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM materials WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        materials = cursor.fetchall()
        
        conn.close()
        
        materials_list = []
        for material in materials:
            materials_list.append({
                "id": material[0],
                "name": material[1],
                "supplier": material[2],
                "price": material[3],
                "unit": material[4],
                "category": material[5] if len(material) > 5 else 'General',
                "pathology_related": material[6] if len(material) > 6 else '',
                "image_url": material[7] if len(material) > 7 else '',
                "is_favorite": bool(material[8]) if len(material) > 8 else False,
                "usage_count": material[9] if len(material) > 9 else 0,
                "created_at": material[10] if len(material) > 10 else (material[7] if len(material) > 7 else material[6])
            })
        
        print(f"✅ Materiales encontrados: {len(materials_list)}")
        return jsonify({"success": True, "materials": materials_list})
    
    except Exception as e:
        print(f"❌ Error al obtener materiales: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials', methods=['POST'])
def add_material():
    """Agregar nuevo material"""
    user_id = session.get('user_id')
    print(f"🔍 POST /materials - User ID: {user_id}")
    
    if not user_id:
        print("❌ Usuario no autenticado")
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        data = request.get_json()
        print(f"�� Datos recibidos: {data}")
        
        name = data.get('name')
        supplier = data.get('supplier')
        price = data.get('price')
        unit = data.get('unit')
        category = data.get('category', 'General')
        pathology_related = data.get('pathology_related', '')
        image_url = data.get('image_url', '')
        
        print(f"🔍 Campos extraídos:")
        print(f"  - name: {name}")
        print(f"  - supplier: {supplier}")
        print(f"  - price: {price}")
        print(f"  - unit: {unit}")
        print(f"  - category: {category}")
        print(f"  - pathology_related: {pathology_related}")
        print(f"  - image_url: {image_url}")
        
        if not all([name, supplier, price, unit]):
            print("❌ Faltan campos requeridos")
            return jsonify({"success": False, "error": "Todos los campos son requeridos"}), 400
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO materials (name, supplier, price, unit, category, pathology_related, image_url, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (name, supplier, price, unit, category, pathology_related, image_url, user_id)
        )
        
        conn.commit()
        conn.close()
        
        print(f"✅ Material guardado en la base de datos: {name}")
        return jsonify({"success": True, "message": "Material agregado exitosamente"})
    
    except Exception as e:
        print(f"❌ Error al guardar material: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/<int:material_id>', methods=['PUT'])
def update_material(material_id):
    """Actualizar material"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        data = request.get_json()
        name = data.get('name')
        supplier = data.get('supplier')
        price = data.get('price')
        unit = data.get('unit')
        category = data.get('category', 'General')
        pathology_related = data.get('pathology_related', '')
        image_url = data.get('image_url', '')
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE materials SET name = ?, supplier = ?, price = ?, unit = ?, category = ?, pathology_related = ?, image_url = ? WHERE id = ? AND user_id = ?",
            (name, supplier, price, unit, category, pathology_related, image_url, material_id, user_id)
        )
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "Material actualizado exitosamente"})
        else:
            conn.close()
            return jsonify({"success": False, "error": "Material no encontrado"}), 404
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/<int:material_id>', methods=['DELETE'])
def delete_material(material_id):
    """Eliminar material"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM materials WHERE id = ? AND user_id = ?", (material_id, user_id))
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "Material eliminado exitosamente"})
        else:
            conn.close()
            return jsonify({"success": False, "error": "Material no encontrado"}), 404
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/most-used', methods=['GET'])
def get_most_used_materials():
    """Obtener materiales más usados"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT name, COUNT(*) as usage_count 
            FROM materials 
            WHERE user_id = ? 
            GROUP BY name 
            ORDER BY usage_count DESC 
            LIMIT 5
        """, (user_id,))
        
        materials = cursor.fetchall()
        conn.close()
        
        materials_list = []
        for material in materials:
            materials_list.append({
                "name": material[0],
                "usage_count": material[1]
            })
        
        return jsonify({"success": True, "materials": materials_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/recent', methods=['GET'])
def get_recent_materials():
    """Obtener materiales recientes"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM materials 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 5
        """, (user_id,))
        
        materials = cursor.fetchall()
        conn.close()
        
        materials_list = []
        for material in materials:
            materials_list.append({
                "id": material[0],
                "name": material[1],
                "supplier": material[2],
                "price": material[3],
                "unit": material[4],
                "created_at": material[6]
            })
        
        return jsonify({"success": True, "materials": materials_list})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/<int:material_id>/use', methods=['POST'])
def use_material(material_id):
    """Usar material (incrementar contador de uso)"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Verificar que el material existe y pertenece al usuario
        cursor.execute("SELECT id FROM materials WHERE id = ? AND user_id = ?", (material_id, user_id))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "error": "Material no encontrado"}), 404
        
        # Aquí podrías agregar lógica para incrementar un contador de uso
        # Por ahora solo devolvemos éxito
        conn.close()
        
        return jsonify({"success": True, "message": "Material usado exitosamente"})
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# NUEVA RUTA PARA ANÁLISIS DE IMÁGENES
@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    """Analizar imagen con IA"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        # Verificar que hay una imagen
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No se proporcionó imagen"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"success": False, "error": "No se seleccionó archivo"}), 400
        
        # Verificar tipo de archivo
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            return jsonify({"success": False, "error": "Formato de imagen no soportado"}), 400
        
        # Cargar modelo YOLOv8
        try:
            from ultralytics import YOLO
            model = YOLO("master_model.pt")
        except Exception as e:
            return jsonify({"success": False, "error": f"Error al cargar modelo: {str(e)}"}), 500
        
        # Leer imagen
        import cv2
        import numpy as np
        from PIL import Image
        
        # Convertir a formato OpenCV
        image = Image.open(file.stream)
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Realizar predicción
        results = model.predict(image_cv, verbose=False)
        
        # Procesar resultados
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Mapear clases correctamente (ajustado a tu modelo .pt)
                    # Según tu feedback: 0=Humedad, 1=Crack, 2=Persona
                    if class_id == 0:
                        label = "Humedad"
                    elif class_id == 1:
                        label = "Crack"
                    elif class_id == 2:
                        label = "Persona"
                    else:
                        label = f"Clase_{class_id}"
                    
                    detection = {
                        "label": label,
                        "confidence": float(confidence),
                        "bbox": [int(x1), int(y1), int(x2), int(y2)],
                        "class_id": class_id
                    }
                    detections.append(detection)
        
        return jsonify({
            "success": True,
            "detections": detections,
            "image_size": [image_cv.shape[1], image_cv.shape[0]],
            "total_detections": len(detections)
        })
    
    except Exception as e:
        print(f"❌ Error al analizar imagen: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/recommendations', methods=['POST'])
def get_material_recommendations():
    """Obtener recomendaciones de materiales basadas en patologías detectadas con algoritmo mejorado"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        data = request.get_json()
        pathologies = data.get('pathologies', [])  # Lista de patologías detectadas: ["Crack", "Humedad", etc.]
        
        if not pathologies:
            return jsonify({"success": True, "materials": []})
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Buscar materiales relacionados con las patologías detectadas
        recommendations = []
        for pathology in pathologies:
            # Normalizar nombres de patologías
            pathology_normalized = pathology.lower()
            if pathology_normalized == 'crack':
                pathology_normalized = 'grieta'
            elif pathology_normalized == 'humedad':
                pathology_normalized = 'humedad'
            
            # Buscar materiales que tengan esta patología en pathology_related
            cursor.execute("""
                SELECT * FROM materials 
                WHERE user_id = ? 
                AND (pathology_related LIKE ? OR pathology_related LIKE ? OR category LIKE ?)
            """, (user_id, f'%{pathology}%', f'%{pathology_normalized}%', f'%{pathology_normalized}%'))
            
            materials = cursor.fetchall()
            for material in materials:
                recommendations.append({
                    "id": material[0],
                    "name": material[1],
                    "supplier": material[2],
                    "price": material[3],
                    "unit": material[4],
                    "category": material[5] if len(material) > 5 else 'General',
                    "pathology_related": material[6] if len(material) > 6 else '',
                    "image_url": material[7] if len(material) > 7 else '',
                    "is_favorite": bool(material[8]) if len(material) > 8 else False,
                    "usage_count": material[9] if len(material) > 9 else 0,
                    "match_reason": pathology,
                    "score": 0  # Score para priorización
                })
        
        # Eliminar duplicados por ID y calcular score de priorización
        seen = {}
        for rec in recommendations:
            if rec['id'] not in seen:
                seen[rec['id']] = rec
            else:
                # Si ya existe, combinar match_reason
                seen[rec['id']]['match_reason'] += f", {rec['match_reason']}"
        
        unique_recommendations = list(seen.values())
        
        # Algoritmo de priorización mejorado
        for rec in unique_recommendations:
            score = 0
            # Priorizar favoritos (+50 puntos)
            if rec.get('is_favorite'):
                score += 50
            # Priorizar por uso frecuente (+30 puntos por cada 10 usos)
            score += (rec.get('usage_count', 0) // 10) * 30
            # Priorizar por precio bajo (más económico = mejor, +20 puntos si precio < 100)
            if rec.get('price', 999999) < 100:
                score += 20
            elif rec.get('price', 999999) < 500:
                score += 10
            # Priorizar materiales recientes (+5 puntos si es nuevo)
            rec['score'] = score
        
        # Ordenar por score (mayor a menor), luego por precio (menor a mayor)
        unique_recommendations.sort(key=lambda x: (-x['score'], x.get('price', 999999)))
        
        conn.close()
        
        return jsonify({"success": True, "materials": unique_recommendations})
    
    except Exception as e:
        print(f"❌ Error al obtener recomendaciones: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/<int:material_id>/favorite', methods=['POST'])
def toggle_favorite(material_id):
    """Marcar/desmarcar material como favorito"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        data = request.get_json()
        is_favorite = data.get('is_favorite', False)
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE materials SET is_favorite = ? WHERE id = ? AND user_id = ?",
            (1 if is_favorite else 0, material_id, user_id)
        )
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            return jsonify({"success": True, "message": "Favorito actualizado"})
        else:
            conn.close()
            return jsonify({"success": False, "error": "Material no encontrado"}), 404
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/materials/<int:material_id>/use', methods=['POST'])
def increment_usage(material_id):
    """Incrementar contador de uso de un material"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "No autenticado"}), 401
    
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE materials SET usage_count = usage_count + 1 WHERE id = ? AND user_id = ?",
            (material_id, user_id)
        )
        
        if cursor.rowcount > 0:
            cursor.execute("SELECT usage_count FROM materials WHERE id = ?", (material_id,))
            usage_count = cursor.fetchone()[0]
            conn.commit()
            conn.close()
            return jsonify({"success": True, "usage_count": usage_count})
        else:
            conn.close()
            return jsonify({"success": False, "error": "Material no encontrado"}), 404
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Ruta para recibir detecciones de la aplicación de escritorio
@app.route('/receive_detections', methods=['POST'])
def receive_detections():
    """Recibir detecciones de la aplicación de escritorio"""
    try:
        data = request.get_json()
        detections = data.get('detections', [])
        timestamp = data.get('timestamp', time.time())
        camera_index = data.get('camera_index', 0)
        
        # Guardar en variable global para que la web pueda acceder
        global latest_detections
        latest_detections = {
            'detections': detections,
            'timestamp': timestamp,
            'camera_index': camera_index
        }
        


        return jsonify({"success": True, "message": "Detecciones recibidas"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Ruta para obtener las últimas detecciones
@app.route('/get_latest_detections', methods=['GET'])
def get_latest_detections():
    """Obtener las últimas detecciones para la web"""
    global latest_detections
    if latest_detections:
        return jsonify(latest_detections)
    else:
        return jsonify({"detections": [], "timestamp": 0, "camera_index": 0})

if __name__ == "__main__":
    # Inicializar base de datos
    init_database()
    
    print("🚀 Servidor Flask iniciado")
    print("📊 Solo funciones de web (registro, login, materiales)")
    print("📹 La cámara es independiente (camara_app.py)")
    print("🖼️ Análisis de imágenes con IA disponible")
    
    app.run(debug=True, host='127.0.0.1', port=5000)