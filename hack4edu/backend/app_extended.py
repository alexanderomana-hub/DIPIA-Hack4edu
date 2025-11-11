# DIPIA Extended Backend for Hack4edu
# Tutor Virtual de Patologías Estructurales

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from ultralytics import YOLO
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Cargar modelos de IA
detector_model = None  # IA N°1: Detector existente
classifier_model = None  # IA N°2: Clasificador de características

def load_models():
    """Cargar ambos modelos de IA"""
    global detector_model, classifier_model
    
    try:
        # Resolver ruta absoluta al archivo del modelo en la RAÍZ del proyecto
        # Estructura: <root>/hack4edu/backend/app_extended.py
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(backend_dir))
        candidate_paths = [
            os.path.join(project_root, "master_model.pt"),
            os.path.join(backend_dir, "master_model.pt"),
            os.path.join(os.getcwd(), "master_model.pt"),
        ]

        model_path = None
        for p in candidate_paths:
            if os.path.exists(p):
                model_path = p
                break

        if not model_path:
            raise FileNotFoundError(
                f"master_model.pt no encontrado. Probadas: {candidate_paths}"
            )

        # IA N°1: Detector existente
        detector_model = YOLO(model_path)
        print(f"✅ IA N°1 (Detector) cargada: {model_path}")
        print("✅ IA N°1 (Detector) cargada correctamente")
        
        # IA N°2: Clasificador (si existe classifier_model.pt)
        classifier_candidates = [
            os.path.join(project_root, "hack4edu", "models", "classifier_model.pt"),
            os.path.join(backend_dir, "classifier_model.pt"),
            os.path.join(os.getcwd(), "classifier_model.pt"),
        ]
        classifier_path = None
        for p in classifier_candidates:
            if os.path.exists(p):
                classifier_path = p
                break

        if classifier_path:
            classifier_model = YOLO(classifier_path)
            print(f"✅ IA N°2 (Clasificador) cargada: {classifier_path}")
        else:
            classifier_model = None
            print("⚠️ IA N°2 (Clasificador) no encontrada (se usará stub)")
        
    except Exception as e:
        print(f"❌ Error cargando modelos: {e}")

def crop_detection(image, bbox):
    """Recortar imagen basada en bounding box"""
    x1, y1, x2, y2 = bbox
    return image[y1:y2, x1:x2]

def classify_damage(cropped_image):
    """Clasificar características del daño (IA N°2). Usa modelo si existe; si no, stub."""
    if classifier_model is None:
        return {
            "crack": {"type": "Grieta_Escalonada", "severity": "Media", "confidence": 0.85},
            "humidity": {"type": "Humedad_Interior", "severity": "Alta", "confidence": 0.92},
            "person": {"type": "Inspector_Presente", "severity": "N/A", "confidence": 1.0},
        }

    try:
        results = classifier_model.predict(cropped_image, verbose=False)
        best_name = None
        best_conf = 0.0

        for r in results:
            if hasattr(r, "probs") and r.probs is not None:
                probs = r.probs.data.cpu().numpy().flatten()
                idx = int(probs.argmax())
                best_conf = float(probs[idx])
                if hasattr(r, "names") and r.names is not None:
                    if isinstance(r.names, dict):
                        best_name = str(r.names.get(idx, f"Class_{idx}"))
                    else:
                        best_name = str(r.names[idx])
                else:
                    best_name = f"Class_{idx}"
            elif hasattr(r, "boxes") and r.boxes is not None and len(r.boxes) > 0:
                cls_val = int(r.boxes.cls[0].cpu().numpy())
                best_conf = float(r.boxes.conf[0].cpu().numpy())
                if hasattr(r, "names") and r.names is not None:
                    if isinstance(r.names, dict):
                        best_name = str(r.names.get(cls_val, f"Class_{cls_val}"))
                    else:
                        best_name = str(r.names[cls_val])
                else:
                    best_name = f"Class_{cls_val}"

        def pick(default_key):
            return {
                "type": best_name or default_key,
                "severity": "Media",
                "confidence": best_conf if best_conf > 0 else 0.5,
            }

        return {
            "crack": pick("Grieta"),
            "humidity": pick("Humedad"),
            "person": {"type": "Inspector_Presente", "severity": "N/A", "confidence": 1.0},
        }
    except Exception as e:
        print(f"⚠️ Error en clasificador IA N°2 (stub): {e}")
        return {
            "crack": {"type": "Grieta_Escalonada", "severity": "Media", "confidence": 0.80},
            "humidity": {"type": "Humedad_Interior", "severity": "Alta", "confidence": 0.80},
            "person": {"type": "Inspector_Presente", "severity": "N/A", "confidence": 1.0},
        }

@app.route('/analyze_extended', methods=['POST'])
def analyze_extended():
    """Análisis extendido con doble IA"""
    try:
        if 'image' not in request.files:
            return jsonify({"success": False, "error": "No image provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"success": False, "error": "No image selected"}), 400
        
        # Leer imagen
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image_cv is None:
            return jsonify({"success": False, "error": "Invalid image format"}), 400
        
        # IA N°1: Detección
        results = detector_model.predict(image_cv, conf=0.5, verbose=False)
        
        detections = []
        cropped_images = []
        
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Mapear clases
                    class_names = {0: "Person", 1: "Crack", 2: "Humidity"}
                    label = class_names.get(class_id, f"Class_{class_id}")
                    
                    detection = {
                        "label": label,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2],
                        "class_id": class_id
                    }
                    detections.append(detection)
                    
                    # Recortar imagen para IA N°2
                    cropped = crop_detection(image_cv, [x1, y1, x2, y2])
                    cropped_images.append(cropped)
        
        # IA N°2: Clasificación de características
        classifications = []
        for i, detection in enumerate(detections):
            if i < len(cropped_images):
                classification = classify_damage(cropped_images[i])
                classifications.append({
                    "detection_id": i,
                    "classification": classification.get(detection["label"].lower(), {})
                })
        
        return jsonify({
            "success": True,
            "detections": detections,
            "classifications": classifications,
            "image_size": [image_cv.shape[1], image_cv.shape[0]],
            "total_detections": len(detections),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error en análisis extendido: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/knowledge/<damage_type>')
def get_knowledge(damage_type):
    """Obtener base de conocimiento para tipo de daño"""
    knowledge_base = {
        "grieta_escalonada": {
            "title": "Grieta Escalonada",
            "definition": "Fisura que sigue un patrón escalonado, típica de asentamientos diferenciales",
            "causes": [
                "Asentamiento diferencial del terreno",
                "Carga excesiva en cimientos",
                "Variaciones en la humedad del suelo"
            ],
            "severity": "Media-Alta",
            "action_required": "Evaluación estructural inmediata",
            "videos": [
                "https://example.com/video1",
                "https://example.com/video2"
            ]
        },
        "humedad_interior": {
            "title": "Humedad Interior",
            "definition": "Presencia de humedad en el interior de la estructura",
            "causes": [
                "Filtraciones de agua",
                "Condensación excesiva",
                "Falta de ventilación"
            ],
            "severity": "Alta",
            "action_required": "Revisión de sistemas hidráulicos",
            "videos": [
                "https://example.com/video3"
            ]
        }
    }
    
    return jsonify(knowledge_base.get(damage_type.lower(), {}))

if __name__ == '__main__':
    load_models()
    app.run(debug=True, port=5001)  # Puerto diferente para no conflictuar
