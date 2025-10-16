import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    "detchPlus", // nombre de tu base de datos
    "root",      // usuario
    "JPTzCuxsSMZGoFzSMafFaBhvQXTDIzde", // contraseña
    {
        host: "viaduct.proxy.rlwy.net", // solo el host
        port: 24845,                    // puerto aparte
        dialect: "mysql",
        logging: false                  // corregido
    }
);

export default sequelize;