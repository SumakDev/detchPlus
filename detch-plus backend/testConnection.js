import sequelize from "./config/database.js";

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión exitosa a la base de datos!");
  } catch (error) {
    console.error("❌ Error al conectar:", error);
  }
}

testConnection();