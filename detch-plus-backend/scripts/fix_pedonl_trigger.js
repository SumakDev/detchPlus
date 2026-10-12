import sequelize from "../config/database.js";

async function run() {
  try {
    console.log("Connecting and dropping old trigger...");
    await sequelize.query("DROP TRIGGER IF EXISTS tr_gen_num_pedonl");

    console.log("Creating fixed trigger...");
    const triggerSql = `
      CREATE TRIGGER tr_gen_num_pedonl BEFORE INSERT ON PED_ONL FOR EACH ROW
      BEGIN
        DECLARE v_next_id INT;
        IF NEW.NUM_PED_ONL IS NULL OR NEW.NUM_PED_ONL = '' OR NEW.NUM_PED_ONL = 'PED-2026000000' THEN
          SELECT IFNULL(MAX(ID_PED_ONL), 0) + 1 INTO v_next_id FROM PED_ONL;
          SET NEW.NUM_PED_ONL = CONCAT('PED-', YEAR(NOW()), LPAD(v_next_id, 6, '0'));
        END IF;
      END;
    `;
    await sequelize.query(triggerSql);

    console.log("Trigger tr_gen_num_pedonl successfully recreated!");

    const [triggers] = await sequelize.query("SHOW TRIGGERS LIKE 'PED_ONL'");
    console.log("Current triggers on PED_ONL:", triggers.map(t => ({ Trigger: t.Trigger, Statement: t.Statement })));

    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
