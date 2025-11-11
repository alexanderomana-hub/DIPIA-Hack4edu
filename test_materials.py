#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de prueba para verificar la funcionalidad de materiales
"""
import sqlite3
import requests
import json

def test_database():
    """Probar la base de datos directamente"""
    print("🔍 Probando base de datos...")
    
    try:
        conn = sqlite3.connect('dipia.db')
        cursor = conn.cursor()
        
        # Verificar estructura de la tabla
        cursor.execute("PRAGMA table_info(materials)")
        columns = cursor.fetchall()
        print("📋 Columnas de la tabla materials:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Contar materiales existentes
        cursor.execute("SELECT COUNT(*) FROM materials")
        count = cursor.fetchone()[0]
        print(f"📊 Materiales existentes: {count}")
        
        # Mostrar materiales
        cursor.execute("SELECT * FROM materials LIMIT 5")
        materials = cursor.fetchall()
        print("📦 Últimos materiales:")
        for material in materials:
            print(f"  - ID: {material[0]}, Name: {material[1]}, Supplier: {material[2]}, Price: {material[3]}, Unit: {material[4]}")
        
        conn.close()
        print("✅ Base de datos OK")
        return True
        
    except Exception as e:
        print(f"❌ Error en base de datos: {e}")
        return False

def test_api():
    """Probar la API de materiales"""
    print("\n🌐 Probando API...")
    
    base_url = "http://127.0.0.1:5000"
    
    try:
        # Probar health
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Servidor Flask funcionando")
        else:
            print(f"❌ Servidor Flask error: {response.status_code}")
            return False
        
        # Probar login (necesario para materiales)
        login_data = {
            "username": "test_user",
            "password": "test_password"
        }
        
        # Intentar login
        response = requests.post(f"{base_url}/login", json=login_data)
        if response.status_code == 200:
            print("✅ Login exitoso")
        else:
            print("⚠️ Login falló, probando registro...")
            
            # Intentar registro
            register_data = {
                "username": "test_user",
                "email": "test@example.com",
                "password": "test_password",
                "full_name": "Test User"
            }
            
            response = requests.post(f"{base_url}/register", json=register_data)
            if response.status_code == 200:
                print("✅ Usuario registrado")
                
                # Intentar login nuevamente
                response = requests.post(f"{base_url}/login", json=login_data)
                if response.status_code == 200:
                    print("✅ Login exitoso después del registro")
                else:
                    print("❌ Login falló después del registro")
                    return False
            else:
                print(f"❌ Registro falló: {response.text}")
                return False
        
        # Probar obtener materiales
        response = requests.get(f"{base_url}/materials")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Materiales obtenidos: {len(data.get('materials', []))}")
        else:
            print(f"❌ Error obteniendo materiales: {response.status_code}")
            return False
        
        # Probar agregar material
        material_data = {
            "name": "Cemento Test",
            "supplier": "Proveedor Test",
            "price": 25.50,
            "unit": "KG"
        }
        
        response = requests.post(f"{base_url}/materials", json=material_data)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Material agregado exitosamente")
            else:
                print(f"❌ Error agregando material: {data.get('error')}")
                return False
        else:
            print(f"❌ Error HTTP agregando material: {response.status_code}")
            print(f"Respuesta: {response.text}")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al servidor Flask")
        print("💡 Asegúrate de que Flask esté ejecutándose en puerto 5000")
        return False
    except Exception as e:
        print(f"❌ Error en API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando pruebas de materiales...")
    
    # Probar base de datos
    db_ok = test_database()
    
    # Probar API
    api_ok = test_api()
    
    if db_ok and api_ok:
        print("\n🎉 ¡Todas las pruebas pasaron!")
    else:
        print("\n⚠️ Algunas pruebas fallaron")
