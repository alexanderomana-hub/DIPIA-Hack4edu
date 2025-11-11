# -*- coding: utf-8 -*-
import cv2
import tkinter as tk
from tkinter import ttk, messagebox
import threading
import requests
import json
import time
from ultralytics import YOLO
import numpy as np

class CameraApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("DIPIA - AI Camera")
        self.root.geometry("800x600")
        self.root.configure(bg="#000000")
        
        # Variables
        self.camera = None
        self.is_running = False
        self.model = None
        self.camera_index = 0
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
        # Cargar modelo IA
        self.load_model()
        
        # Crear interfaz
        self.create_interface()
        
        # NO inicializar cámara automáticamente
        # La cámara solo se activa cuando se presiona "Iniciar"
    
    def load_model(self):
        """Cargar el modelo de IA"""
        try:
            self.model = YOLO("master_model.pt")
            print("✅ Modelo de IA cargado correctamente")
        except Exception as e:
            print(f"❌ Error al cargar el modelo: {e}")
            messagebox.showerror("Error", f"No se pudo cargar el modelo de IA: {e}")
    
    def create_interface(self):
        """Crear la interfaz de usuario"""
        # Titulo
        title_label = tk.Label(
            self.root, 
            text="🎥 DIPIA - AI Camera", 
            font=("Arial", 16, "bold"),
            fg="#FFD700",
            bg="#000000"
        )
        title_label.pack(pady=10)
        
        # Frame para controles
        control_frame = tk.Frame(self.root, bg="#000000")
        control_frame.pack(pady=10)
        
        # Selector de camara
        tk.Label(control_frame, text="Camera:", fg="white", bg="#000000").pack(side=tk.LEFT, padx=5)
        self.camera_var = tk.StringVar(value="0")
        
        # Detectar cámaras disponibles
        available_cameras = self.detect_cameras()
        camera_combo = ttk.Combobox(control_frame, textvariable=self.camera_var, values=available_cameras, width=5)
        camera_combo.pack(side=tk.LEFT, padx=5)
        
        # Selector de calidad
        tk.Label(control_frame, text="Quality:", fg="white", bg="#000000").pack(side=tk.LEFT, padx=(20, 5))
        self.quality_var = tk.StringVar(value="HD")
        quality_combo = ttk.Combobox(control_frame, textvariable=self.quality_var, values=["480p", "HD", "FHD"], width=8)
        quality_combo.pack(side=tk.LEFT, padx=5)
        
        # Botones
        self.start_btn = tk.Button(
            control_frame, 
            text="▶️ Start", 
            command=self.start_camera,
            bg="#FFD700",
            fg="#000000",
            font=("Arial", 10, "bold"),
            padx=20
        )
        self.start_btn.pack(side=tk.LEFT, padx=5)
        
        self.stop_btn = tk.Button(
            control_frame, 
            text="⏹️ Stop", 
            command=self.stop_camera,
            bg="#FF0000",
            fg="white",
            font=("Arial", 10, "bold"),
            padx=20,
            state="disabled"
        )
        self.stop_btn.pack(side=tk.LEFT, padx=5)
        
        # Frame para video
        self.video_frame = tk.Frame(self.root, bg="#333333", relief=tk.RAISED, bd=2)
        self.video_frame.pack(pady=10, padx=10, fill=tk.BOTH, expand=True)
        
        # Label para mostrar video
        self.video_label = tk.Label(self.video_frame, bg="#000000")
        self.video_label.pack(expand=True)
        
        # Frame para informacion
        info_frame = tk.Frame(self.root, bg="#000000")
        info_frame.pack(pady=10, fill=tk.X)
        
        # Status
        self.status_label = tk.Label(
            info_frame, 
            text="Status: Stopped", 
            fg="white", 
            bg="#000000",
            font=("Arial", 10)
        )
        self.status_label.pack(side=tk.LEFT)
        
        # FPS
        self.fps_label = tk.Label(
            info_frame, 
            text="FPS: 0", 
            fg="#00FF00", 
            bg="#000000",
            font=("Arial", 10, "bold")
        )
        self.fps_label.pack(side=tk.RIGHT, padx=(0, 20))
        
        # Detecciones
        self.detection_label = tk.Label(
            info_frame, 
            text="Detections: 0", 
            fg="#FFD700", 
            bg="#000000",
            font=("Arial", 10)
        )
        self.detection_label.pack(side=tk.RIGHT)
    
    def detect_cameras(self):
        """Detectar cámaras disponibles"""
        available = []
        print("🔍 Detecting available cameras...")
        
        for i in range(5):  # Probar hasta 5 cámaras
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret and frame is not None:
                    available.append(str(i))
                    print(f"✅ Camera {i} detected")
                cap.release()
            else:
                cap.release()
        
        if not available:
            available = ["0"]  # Al menos mostrar opción 0
            print("⚠️ No cameras detected, defaulting to camera 0")
        
        return available
    
    def init_camera(self):
        """Inicializar la camara"""
        try:
            # Liberar cámara anterior si existe
            if self.camera:
                self.camera.release()
            
            # Obtener índice de cámara del selector
            self.camera_index = int(self.camera_var.get())
            
            # Intentar abrir la cámara con diferentes configuraciones
            print(f"🔍 Intentando abrir cámara {self.camera_index}...")
            
            # Método 1: DirectShow (Windows)
            self.camera = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
            if not self.camera.isOpened():
                print("❌ DirectShow falló, intentando método estándar...")
                # Método 2: Estándar
                self.camera = cv2.VideoCapture(self.camera_index)
            
            if not self.camera.isOpened():
                print("❌ Método estándar falló, intentando con MSMF...")
                # Método 3: Microsoft Media Foundation
                self.camera = cv2.VideoCapture(self.camera_index, cv2.CAP_MSMF)
            
            if self.camera.isOpened():
                # Configurar resolución según calidad seleccionada
                quality = self.quality_var.get()
                if quality == "480p":
                    width, height = 640, 480
                    fps = 30
                elif quality == "HD":
                    width, height = 1280, 720
                    fps = 60
                elif quality == "FHD":
                    width, height = 1920, 1080
                    fps = 30
                else:
                    width, height = 1280, 720
                    fps = 60
                
                # Configurar propiedades para mejor calidad y FPS
                self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, width)
                self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
                self.camera.set(cv2.CAP_PROP_FPS, fps)
                self.camera.set(cv2.CAP_PROP_BRIGHTNESS, 0.5)
                self.camera.set(cv2.CAP_PROP_CONTRAST, 0.5)
                self.camera.set(cv2.CAP_PROP_SATURATION, 0.5)
                self.camera.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.25)  # Control de exposición
                self.camera.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('M', 'J', 'P', 'G'))  # Mejor compresión
                
                print(f"📹 Camera configured: {width}x{height} @ {fps}fps")
                
                # Esperar un momento para que la cámara se estabilice
                time.sleep(1)
                
                # Probar que la cámara realmente funciona
                ret, test_frame = self.camera.read()
                if ret and test_frame is not None:
                    self.status_label.config(text="Status: Camera ready")
                    print(f"✅ Camara {self.camera_index} inicializada correctamente")
                    return True
                else:
                    self.status_label.config(text="Status: Error - Cannot read")
                    print(f"❌ Camara {self.camera_index} no puede leer frames")
                    return False
            else:
                self.status_label.config(text="Status: Camera error")
                print(f"❌ No se pudo abrir la camara {self.camera_index}")
                return False
        except Exception as e:
            print(f"❌ Error al inicializar camara: {e}")
            self.status_label.config(text="Status: Error")
            return False
    
    def start_camera(self):
        """Iniciar la camara"""
        # Siempre inicializar la cámara cuando se presiona Iniciar
        if not self.init_camera():
            messagebox.showerror("Error", "No se pudo inicializar la camara")
            return
        
        if self.camera and self.camera.isOpened():
            self.is_running = True
            self.start_btn.config(state="disabled")
            self.stop_btn.config(state="normal")
            self.status_label.config(text="Status: Recording...")
            
            # Iniciar hilo de video
            self.video_thread = threading.Thread(target=self.video_loop)
            self.video_thread.daemon = True
            self.video_thread.start()
        else:
            messagebox.showerror("Error", "No se pudo inicializar la camara")
    
    def stop_camera(self):
        """Detener la camara"""
        self.is_running = False
        self.start_btn.config(state="normal")
        self.stop_btn.config(state="disabled")
        self.status_label.config(text="Status: Stopped")
        self.detection_label.config(text="Detections: 0")
        
        # Liberar la cámara cuando se detiene
        if self.camera:
            self.camera.release()
            self.camera = None
            print("✅ Cámara liberada")
    
    def video_loop(self):
        """Loop principal de video optimizado"""
        frame_count = 0
        last_ai_process = 0
        ai_process_interval = 2  # Procesar IA cada 2 frames para mejor FPS
        last_display_time = 0
        min_display_interval = 1/30  # Máximo 30 FPS para display
        
        while self.is_running and self.camera and self.camera.isOpened():
            ret, frame = self.camera.read()
            if not ret:
                print("❌ No se pudo leer frame de la camara")
                break
            
            frame_count += 1
            
            # Calcular FPS cada 30 frames
            if frame_count % 30 == 0:
                current_time = time.time()
                elapsed_time = current_time - self.fps_start_time
                self.current_fps = 30 / elapsed_time
                self.fps_start_time = current_time
                self.fps_label.config(text=f"FPS: {self.current_fps:.1f}")
            
            # Verificar que el frame no esté vacío o corrupto
            if frame is None or frame.size == 0:
                print("❌ Frame vacío o corrupto")
                continue
            
            # Validar dimensiones del frame
            if len(frame.shape) != 3 or frame.shape[2] != 3:
                print("❌ Frame con formato incorrecto")
                continue
            
            # Procesar con IA solo cada ciertos frames para mejor rendimiento
            detections = []
            if frame_count % ai_process_interval == 0:
                detections = self.process_with_ai(frame)
                last_ai_process = frame_count
                
                # Mostrar información de detección en consola
                if detections:
                    print(f"🔍 Detected {len(detections)} objects: {[d['label'] for d in detections]}")
                    # Debug: mostrar información detallada
                    for det in detections:
                        print(f"   - {det['label']} (class_id: {det['class_id']}, confidence: {det['confidence']:.2f})")
                else:
                    print(f"🔍 No detections in frame {frame_count}")
            
            # Dibujar detecciones (usar las últimas detecciones si no procesamos IA este frame)
            if detections or last_ai_process > 0:
                frame_with_detections = self.draw_detections(frame, detections if detections else [])
            else:
                frame_with_detections = frame
            
            # Mostrar en la interfaz (con control de velocidad)
            current_time = time.time()
            if current_time - last_display_time >= min_display_interval:
                self.display_frame(frame_with_detections)
                last_display_time = current_time
            
            # Enviar datos a la web solo si hay detecciones
            if detections:
                self.send_to_web(detections)
            
            # Pequeña pausa para evitar sobrecarga del CPU
            time.sleep(0.01)
    
    def process_with_ai(self, frame):
        """Procesar frame con IA optimizado"""
        if not self.model:
            return []
        
        try:
            # Redimensionar frame para IA si es muy grande (mejor rendimiento)
            height, width = frame.shape[:2]
            if width > 640:
                scale = 640 / width
                new_width = 640
                new_height = int(height * scale)
                frame_resized = cv2.resize(frame, (new_width, new_height))
            else:
                frame_resized = frame
                scale = 1.0
            
            # Procesar con IA (configuración optimizada)
            print(f"🔍 Procesando frame {width}x{height} -> {new_width}x{new_height}")
            results = self.model.predict(
                frame_resized, 
                verbose=False,
                conf=0.3,  # Bajar confianza para más detecciones
                iou=0.45,  # Non-maximum suppression
                max_det=10,  # Máximo 10 detecciones por frame
                device='cpu'  # Usar CPU para estabilidad
            )
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    print(f"🔍 YOLO detectó {len(boxes)} objetos")
                    for box in boxes:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        print(f"   - Objeto: class_id={class_id}, conf={confidence:.2f}")
                        
                        # Escalar coordenadas de vuelta al frame original
                        if scale != 1.0:
                            x1 = int(x1 / scale)
                            y1 = int(y1 / scale)
                            x2 = int(x2 / scale)
                            y2 = int(y2 / scale)
                        
                        # Mapear clases correctamente
                        # Ajustar según lo que realmente detecta el modelo
                        if class_id == 0:
                            label = "Person"     # Clase 0 = Persona
                        elif class_id == 1:
                            label = "Crack"      # Clase 1 = Grieta
                        elif class_id == 2:
                            label = "Humidity"   # Clase 2 = Humedad
                        elif class_id == 8:
                            label = "Person"     # Clase 8 también puede ser Persona
                        else:
                            label = f"Class_{class_id}"
                        
                        # Solo procesar detecciones con confianza alta
                        if confidence < 0.3:  # Bajar umbral
                            print(f"   - Rechazado por confianza baja: {confidence:.2f}")
                            continue
                        
                        print(f"   - Aceptado: {label} en ({x1},{y1})-({x2},{y2})")
                        
                        detections.append({
                            "label": label,
                            "confidence": float(confidence),
                            "bbox": [int(x1), int(y1), int(x2), int(y2)],
                            "class_id": class_id
                        })
                else:
                    print("🔍 YOLO no detectó objetos")
            
            return detections
        except Exception as e:
            print(f"Error en procesamiento IA: {e}")
            return []
    
    def draw_detections(self, frame, detections):
        """Dibujar detecciones en el frame con bounding boxes visibles"""
        colors = {
            "Person": (0, 255, 0),     # Verde
            "Crack": (0, 0, 255),      # Rojo
            "Humidity": (255, 0, 0)    # Azul
        }
        
        for detection in detections:
            x1, y1, x2, y2 = detection["bbox"]
            label = detection["label"]
            confidence = detection["confidence"]
            color = colors.get(label, (255, 255, 255))
            
            # Dibujar rectángulo más grueso y visible
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            
            # Dibujar etiqueta con fondo para mejor visibilidad
            text = f"{label}: {confidence:.2f}"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.7
            thickness = 2
            
            # Obtener tamaño del texto
            (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)
            
            # Dibujar fondo para el texto
            cv2.rectangle(frame, (x1, y1 - text_height - 10), (x1 + text_width, y1), color, -1)
            
            # Dibujar texto en blanco para contraste
            cv2.putText(frame, text, (x1, y1 - 5), font, font_scale, (255, 255, 255), thickness)
            
            # Dibujar ID de clase en la esquina inferior derecha del rectángulo
            class_text = f"ID: {detection['class_id']}"
            cv2.putText(frame, class_text, (x2 - 50, y2 - 5), font, 0.5, (255, 255, 255), 1)
        
        return frame
    
    def display_frame(self, frame):
        """Mostrar frame en la interfaz optimizado"""
        try:
            # Verificar que el frame sea válido
            if frame is None or frame.size == 0:
                return
            
            # Redimensionar frame para la interfaz
            height, width = frame.shape[:2]
            max_width = 800
            max_height = 450
            
            if width > max_width or height > max_height:
                scale = min(max_width/width, max_height/height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
            
            # Convertir BGR a RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Método más simple y directo para Tkinter
            frame_pil = tk.PhotoImage(data=cv2.imencode('.png', frame_rgb)[1].tobytes())
            
            # Mostrar en label
            self.video_label.config(image=frame_pil)
            self.video_label.image = frame_pil  # Mantener referencia
            
        except Exception as e:
            # Método alternativo más robusto
            try:
                # Redimensionar si es necesario
                height, width = frame.shape[:2]
                if width > 800 or height > 450:
                    scale = min(800/width, 450/height)
                    new_width = int(width * scale)
                    new_height = int(height * scale)
                    frame = cv2.resize(frame, (new_width, new_height))
                
                # Convertir y mostrar
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_pil = tk.PhotoImage(data=cv2.imencode('.png', frame_rgb)[1].tobytes())
                self.video_label.config(image=frame_pil)
                self.video_label.image = frame_pil
            except:
                # Si todo falla, no mostrar nada para evitar spam
                pass
    
    def send_to_web(self, detections):
        """Enviar detecciones a la web"""
        try:
            if detections:
                data = {
                    "detections": detections,
                    "timestamp": time.time(),
                    "camera_index": self.camera_index
                }
                
                # Enviar a Flask
                response = requests.post(
                    "http://127.0.0.1:5000/receive_detections",
                    json=data,
                    timeout=1
                )
                
                if response.status_code == 200:
                    self.detection_label.config(text=f"Detections: {len(detections)}")
                else:
                    print(f"Error al enviar datos: {response.status_code}")
        except Exception as e:
            # No mostrar error en consola para evitar spam
            pass
    
    def run(self):
        """Ejecutar la aplicacion"""
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.root.mainloop()
    
    def on_closing(self):
        """Manejar cierre de ventana"""
        self.is_running = False
        if self.camera:
            self.camera.release()
        self.root.destroy()

if __name__ == "__main__":
    app = CameraApp()
    app.run()