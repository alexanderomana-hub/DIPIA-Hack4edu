import cv2
import numpy as np
from ultralytics import YOLO
import time

def main():
    print("🚀 Iniciando aplicación de cámara con IA...")
    
    # Cargar modelo YOLO
    try:
        model = YOLO("master_model.pt")
        print("✅ Modelo de IA cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo: {e}")
        return
    
    # Detectar cámaras disponibles
    print("🔍 Detectando cámaras disponibles...")
    available_cameras = []
    for i in range(5):  # Probar hasta 5 cámaras
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            ret, frame = cap.read()
            if ret and frame is not None:
                available_cameras.append(i)
                print(f"✅ Camera {i} detected")
            cap.release()
        else:
            break
    
    if not available_cameras:
        print("❌ No se encontraron cámaras disponibles")
        return
    
    # Usar la primera cámara disponible
    camera_index = available_cameras[0]
    print(f"📹 Usando cámara {camera_index}")
    
    # Inicializar cámara
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        print(f"❌ No se pudo abrir la cámara {camera_index}")
        return
    
    # Configurar cámara
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    print("✅ Cámara inicializada correctamente")
    print("🎯 Presiona 'q' para salir, 's' para capturar pantalla")
    
    frame_count = 0
    last_detection_time = 0
    
    # Colores para las clases
    colors = {
        "Person": (0, 255, 0),     # Verde
        "Crack": (0, 0, 255),      # Rojo
        "Humidity": (255, 0, 0)    # Azul
    }
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ No se pudo leer frame de la cámara")
            break
        
        frame_count += 1
        
        # Procesar con IA cada 10 frames para mejor rendimiento
        detections = []
        if frame_count % 10 == 0:
            try:
                # Redimensionar para IA
                height, width = frame.shape[:2]
                if width > 640:
                    scale = 640 / width
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame_resized = cv2.resize(frame, (new_width, new_height))
                else:
                    frame_resized = frame
                
                # Procesar con YOLO
                results = model.predict(frame_resized, conf=0.5, verbose=False)
                
                for result in results:
                    if result.boxes is not None:
                        boxes = result.boxes.xyxy.cpu().numpy()
                        confidences = result.boxes.conf.cpu().numpy()
                        class_ids = result.boxes.cls.cpu().numpy().astype(int)
                        
                        for i, (box, conf, class_id) in enumerate(zip(boxes, confidences, class_ids)):
                            # Mapear clases correctamente
                            if class_id == 0:
                                label = "Person"
                            elif class_id == 1:
                                label = "Crack"
                            elif class_id == 2:
                                label = "Humidity"
                            else:
                                label = f"Class_{class_id}"
                            
                            # Escalar coordenadas de vuelta al frame original
                            if width > 640:
                                x1, y1, x2, y2 = (box * scale).astype(int)
                            else:
                                x1, y1, x2, y2 = box.astype(int)
                            
                            detections.append({
                                "bbox": [x1, y1, x2, y2],
                                "label": label,
                                "confidence": conf,
                                "class_id": class_id
                            })
                
                if detections:
                    print(f"🔍 Detected {len(detections)} objects: {[d['label'] for d in detections]}")
                    last_detection_time = time.time()
                
            except Exception as e:
                print(f"❌ Error en procesamiento IA: {e}")
        
        # Dibujar detecciones en el frame
        for detection in detections:
            x1, y1, x2, y2 = detection["bbox"]
            label = detection["label"]
            confidence = detection["confidence"]
            color = colors.get(label, (255, 255, 255))
            
            # Dibujar rectángulo
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            
            # Dibujar etiqueta con fondo
            text = f"{label}: {confidence:.2f}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            thickness = 2
            
            # Obtener tamaño del texto
            (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
            
            # Dibujar fondo para el texto
            cv2.rectangle(frame, (x1, y1 - text_height - 10), (x1 + text_width, y1), color, -1)
            
            # Dibujar texto en blanco
            cv2.putText(frame, text, (x1, y1 - 5), font, font_scale, (255, 255, 255), thickness)
            
            # Dibujar ID de clase
            class_text = f"ID: {detection['class_id']}"
            cv2.putText(frame, class_text, (x2 - 50, y2 - 5), font, 0.5, (255, 255, 255), 1)
        
        # Mostrar información en pantalla
        info_text = f"Frame: {frame_count} | Detections: {len(detections)}"
        cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Mostrar frame
        cv2.imshow("Camera with AI Detection", frame)
        
        # Control de teclado
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            # Capturar pantalla
            filename = f"capture_{int(time.time())}.jpg"
            cv2.imwrite(filename, frame)
            print(f"📸 Captura guardada como {filename}")
    
    # Limpiar
    cap.release()
    cv2.destroyAllWindows()
    print("✅ Aplicación cerrada correctamente")

if __name__ == "__main__":
    main()

