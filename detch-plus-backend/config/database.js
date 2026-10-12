import "dotenv/config";
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.DB_DATABASE || "railway",
    process.env.DB_USERNAME || "root",
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: "mysql",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        define: {
            timestamps: false,
            underscored: false,
        }
    }
);

// Probar conexión al iniciar
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("✓ Conexión a base de datos exitosa");
    } catch (error) {
        console.error("✗ Error conectando a base de datos:", error.message);
        process.exit(1);
    }
};

export default sequelize;