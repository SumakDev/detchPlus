import "dotenv/config";
import mysql from "mysql2/promise";

async function testConnection() {
  try {
    console.log("🔍 Intentando conectar a Railway...");
    console.log("Host:", process.env.DB_HOST);
    console.log("Puerto:", process.env.DB_PORT);
    console.log("Usuario:", process.env.DB_USERNAME);
    console.log("Database:", process.env.DB_DATABASE);

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });

    console.log("✓ Conectado exitosamente!");
    
    const [rows] = await connection.execute("SHOW TABLES;");
    console.log("Tablas encontradas:", rows);

    await connection.end();
  } catch (error) {
    console.error("✗ Error:", error.message);
    console.error("Código:", error.code);
  }
}

testConnection();