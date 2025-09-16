<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagrama ER - Sistema de Venta de iPhones</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .diagram-container {
            padding: 40px;
            background: #f8f9fa;
        }
        
        .legend {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 20px;
            background: white;
            border-radius: 25px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 50%;
        }
        
        .core { background: #e74c3c; }
        .users { background: #3498db; }
        .ecommerce { background: #27ae60; }
        .inventory { background: #f39c12; }
        .financial { background: #9b59b6; }
        .service { background: #1abc9c; }
        
        .diagram {
            position: relative;
            min-height: 1200px;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
        }
        
        .table {
            position: absolute;
            background: white;
            border: 2px solid;
            border-radius: 12px;
            min-width: 220px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .table:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        
        .table-header {
            padding: 15px;
            font-weight: bold;
            font-size: 14px;
            text-align: center;
            color: white;
            border-radius: 10px 10px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .table-body {
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .field {
            display: flex;
            align-items: center;
            padding: 6px 0;
            font-size: 12px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .field:last-child {
            border-bottom: none;
        }
        
        .field-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            border-radius: 3px;
        }
        
        .pk { background: #e74c3c; }
        .fk { background: #3498db; }
        .regular { background: #95a5a6; }
        .index { background: #f39c12; }
        
        .connection {
            position: absolute;
            background: #34495e;
            z-index: 1;
        }
        
        .connection-label {
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            z-index: 2;
        }
        
        /* Posicionamiento de tablas */
        .productos { top: 50px; left: 50px; border-color: #e74c3c; }
        .categorias { top: 50px; left: 320px; border-color: #e74c3c; }
        .marcas { top: 50px; left: 520px; border-color: #e74c3c; }
        .proveedores { top: 50px; left: 720px; border-color: #e74c3c; }
        
        .usuarios { top: 300px; left: 50px; border-color: #3498db; }
        .roles { top: 300px; left: 320px; border-color: #3498db; }
        .sesiones { top: 480px; left: 50px; border-color: #3498db; }
        
        .carrito { top: 300px; left: 520px; border-color: #27ae60; }
        .pedidos { top: 300px; left: 720px; border-color: #27ae60; }
        .cupones { top: 480px; left: 520px; border-color: #27ae60; }
        .resenas { top: 480px; left: 720px; border-color: #27ae60; }
        
        .stock { top: 660px; left: 50px; border-color: #f39c12; }
        .movimientos { top: 660px; left: 320px; border-color: #f39c12; }
        
        .facturas { top: 660px; left: 520px; border-color: #9b59b6; }
        .evaluaciones { top: 840px; left: 520px; border-color: #9b59b6; }
        .movimientos-financieros { top: 840px; left: 320px; border-color: #9b59b6; }
        
        .servicios { top: 660px; left: 920px; border-color: #1abc9c; }
        .tecnicos { top: 840px; left: 920px; border-color: #1abc9c; }
        
        .clientes { top: 840px; left: 50px; border-color: #34495e; }
        .empleados { top: 1020px; left: 50px; border-color: #34495e; }
        
        .notificaciones { top: 1020px; left: 320px; border-color: #8e44ad; }
        .observaciones { top: 1020px; left: 520px; border-color: #8e44ad; }
        
        .core-header { background: #e74c3c; }
        .users-header { background: #3498db; }
        .ecommerce-header { background: #27ae60; }
        .inventory-header { background: #f39c12; }
        .financial-header { background: #9b59b6; }
        .service-header { background: #1abc9c; }
        .support-header { background: #34495e; }
        .system-header { background: #8e44ad; }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
            padding: 20px 0;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            font-size: 2em;
            margin-bottom: 10px;
        }
        
        .stat-card p {
            opacity: 0.9;
        }
        
        @media (max-width: 768px) {
            .diagram {
                min-height: 2000px;
            }
            
            .table {
                position: relative !important;
                margin: 20px 0 !important;
                top: auto !important;
                left: auto !important;
            }
            
            .legend {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🍎 Sistema de Venta de iPhones</h1>
            <p>Diagrama de Base de Datos MongoDB - Arquitectura Completa</p>
        </div>
        
        <div class="diagram-container">
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color core"></div>
                    <span>Productos Core</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color users"></div>
                    <span>Usuarios & Auth</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color ecommerce"></div>
                    <span>E-Commerce</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color inventory"></div>
                    <span>Inventario</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color financial"></div>
                    <span>Financiero</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color service"></div>
                    <span>Servicio Técnico</span>
                </div>
            </div>
            
            <div class="diagram">
                <!-- PRODUCTOS CORE -->
                <div class="table productos">
                    <div class="table-header core-header">
                        📱 productos
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            codigoBarras: String
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            imei: String
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            categoria: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            marca: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            modelo: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            descripcion: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            imagenes: [String]
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            origen: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            estado: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            detalles: Object
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            stock: Object
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            precios: Object
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            metadatos: Object
                        </div>
                    </div>
                </div>
                
                <div class="table categorias">
                    <div class="table-header core-header">
                        📂 categorias
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            nombre: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            descripcion: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            activo: Boolean
                        </div>
                    </div>
                </div>
                
                <div class="table marcas">
                    <div class="table-header core-header">
                        🏷️ marcas
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            nombre: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            descripcion: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            logo: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            activo: Boolean
                        </div>
                    </div>
                </div>
                
                <div class="table proveedores">
                    <div class="table-header core-header">
                        🏪 proveedores
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            nombre: String
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            ruc: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            telefono: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            email: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            direccion: String
                        </div>
                    </div>
                </div>
                
                <!-- USUARIOS Y AUTENTICACIÓN -->
                <div class="table usuarios">
                    <div class="table-header users-header">
                        👤 usuarios
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            username: String
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            email: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            passwordHash: String
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            rol: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            perfil: Object
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            direcciones: [Object]
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            estado: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            seguridad: Object
                        </div>
                    </div>
                </div>
                
                <div class="table roles">
                    <div class="table-header users-header">
                        🔐 roles
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            nombre: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            descripcion: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            permisos: Object
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            activo: Boolean
                        </div>
                    </div>
                </div>
                
                <div class="table sesiones">
                    <div class="table-header users-header">
                        🔑 sesiones
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: String
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            usuario: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            ipAddress: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            userAgent: String
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            expiraEn: Date
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            activa: Boolean
                        </div>
                    </div>
                </div>
                
                <!-- E-COMMERCE -->
                <div class="table carrito">
                    <div class="table-header ecommerce-header">
                        🛒 carrito
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            usuario: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            items: [Object]
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            fechaActualizacion: Date
                        </div>
                    </div>
                </div>
                
                <div class="table pedidos">
                    <div class="table-header ecommerce-header">
                        📦 pedidos_online
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            numeroPedido: String
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            usuario: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            items: [Object]
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            direccionEnvio: Object
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            resumen: Object
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            estadoPedido: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            estadoPago: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            envio: Object
                        </div>
                    </div>
                </div>
                
                <div class="table cupones">
                    <div class="table-header ecommerce-header">
                        🎫 cupones
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            codigo: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            nombre: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            tipoDescuento: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            valorDescuento: Number
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            fechaInicio: Date
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            fechaFin: Date
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            usosActuales: Number
                        </div>
                    </div>
                </div>
                
                <div class="table resenas">
                    <div class="table-header ecommerce-header">
                        ⭐ reseñas
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            producto: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            usuario: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            calificacion: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            titulo: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            comentario: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            verificada: Boolean
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            estado: Enum
                        </div>
                    </div>
                </div>
                
                <!-- INVENTARIO -->
                <div class="table stock">
                    <div class="table-header inventory-header">
                        📊 stock (embebido)
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon regular"></div>
                            cantidadDisponible: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            cantidadReservada: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            ubicacion: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            stockMinimo: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            stockMaximo: Number
                        </div>
                    </div>
                </div>
                
                <div class="table movimientos">
                    <div class="table-header inventory-header">
                        📈 movimientos_inventario
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            producto: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            tipo: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            cantidad: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            motivo: String
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            numeroDocumento: String
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            empleado: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            fechaMovimiento: Date
                        </div>
                    </div>
                </div>
                
                <!-- FINANCIERO -->
                <div class="table facturas">
                    <div class="table-header financial-header">
                        🧾 facturas
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            numeroFactura: String
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            cliente: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            empleado: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            items: [Object]
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            subtotal: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            iva: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            total: Number
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            estado: Enum
                        </div>
                    </div>
                </div>
                
                <div class="table evaluaciones">
                    <div class="table-header financial-header">
                        💰 evaluaciones_parte_pago
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            cliente: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            producto: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon fk"></div>
                            empleado: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            evaluacion: Object
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            estado: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            valorFinal: Number
                        </div>
                    </div>
                </div>
                
                <div class="table movimientos-financieros">
                    <div class="table-header financial-header">
                        💳 movimientos_financieros
                    </div>
                    <div class="table-body">
                        <div class="field">
                            <div class="field-icon pk"></div>
                            _id: ObjectId
                        </div>
                        <div class="field">
                            <div class="field-icon index"></div>
                            tipo: Enum
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            monto: Number
                        </div>
                        <div class="field">
                            <div class="field-icon regular"></div>
                            descripcion: String
                        </div>
                        <div class="field">
                            <div class="fiel