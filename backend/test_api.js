import jwt from "jsonwebtoken";
import fetch from "node-fetch";

// Assuming JWT_SECRET is available in .env, but we can just use the actual env if we run with dotenv
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(".env") });

async function main() {
  const token = jwt.sign({ userId: 'ca6abefc-842b-11f1-94cf-8c1645374493' }, process.env.JWT_SECRET || "ac_erp_secret_key_2024", { expiresIn: '1h' });
  
  const response = await fetch("http://localhost:3000/api/v1/paiements", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
main().catch(console.error);
