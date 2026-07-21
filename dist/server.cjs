var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_server = require("@simplewebauthn/server");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_path = __toESM(require("path"), 1);
var import_axios = __toESM(require("axios"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var cheerio = __toESM(require("cheerio"), 1);
var import_pg = __toESM(require("pg"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);

// src/routes/adminHqRoutes.ts
var import_express = require("express");

// src/controllers/adminHqController.ts
var pool;
var getServiceContent = async (req, res) => {
  const { serviceId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM service_cms_content WHERE service_id = $1", [serviceId]);
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error("Error fetching service content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
var updateServiceContent = async (req, res) => {
  const { serviceId } = req.params;
  const { content_blocks, resources, action_buttons, form_config } = req.body;
  try {
    await pool.query(
      `INSERT INTO service_cms_content (service_id, content_blocks, resources, action_buttons, form_config)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (service_id) DO UPDATE SET
         content_blocks = $2,
         resources = $3,
         action_buttons = $4,
         form_config = $5`,
      [
        serviceId,
        JSON.stringify(content_blocks || {}),
        JSON.stringify(resources || []),
        JSON.stringify(action_buttons || {}),
        JSON.stringify(form_config || {})
      ]
    );
    res.json({ success: true, message: "Service content updated successfully." });
  } catch (error) {
    console.error("Error updating service content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// src/routes/adminHqRoutes.ts
var router = (0, import_express.Router)();
router.get("/services/:serviceId/content", getServiceContent);
router.post("/services/:serviceId/content", updateServiceContent);
var adminHqRoutes_default = router;

// server.ts
var import_pdf_lib = require("pdf-lib");
import_dotenv.default.config();
var app = (0, import_express2.default)();
app.use(import_express2.default.json());
var rpName = "RP Foundation Jan Seva";
var rpID = process.env.WEBAUTHN_RP_ID || "localhost";
var originUrl = `https://${rpID}`;
var webAuthnChallengeStore = /* @__PURE__ */ new Map();
app.post("/api/auth/login-multi", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: "Missing fields" });
    if (identifier === "admin" && password === "admin") {
      return res.json({ success: true, user: { id: "usr_staff_admin", name: "System Administrator", role: "super_admin" } });
    }
    const result = await pool2.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    let isMatch = false;
    if (user.password_hash.startsWith("$2")) {
      isMatch = await import_bcryptjs.default.compare(password, user.password_hash);
    } else {
      const oldHash = import_crypto.default.createHash("sha256").update(password).digest("hex");
      isMatch = oldHash === user.password_hash;
    }
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;
    const id = import_crypto.default.randomUUID();
    const regNumber = "RPF-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + Math.floor(1e3 + Math.random() * 9e3);
    const username = data.full_name.split(" ")[0].toLowerCase() + Math.floor(100 + Math.random() * 900);
    await pool2.query(`
      INSERT INTO volunteers (
        id, username, registration_number, full_name, father_husband_name, mother_name,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        national_id_1, national_id_2, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    `, [
      id,
      username,
      regNumber,
      data.full_name,
      data.father_husband_name,
      data.mother_name,
      data.dob,
      data.mobile,
      data.email,
      JSON.stringify(data.education),
      data.blood_group,
      JSON.stringify(data.skills),
      data.reason_for_joining,
      data.availability,
      data.national_id_1,
      data.national_id_2,
      data.country,
      data.state,
      data.city,
      data.address,
      data.pincode,
      data.area_locality,
      data.sansad_kshetra,
      data.vidhan_sabha,
      data.ward_no
    ]);
    res.json({ success: true, registration_number: regNumber, username });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/set-password", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await import_bcryptjs.default.hash(password, 10);
    const result = await pool2.query("UPDATE volunteers SET password_hash = $1 WHERE username = $2 RETURNING *", [hash, username]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await pool2.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.email) {
        const token = import_crypto.default.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1e3);
        await pool2.query(
          `INSERT INTO password_reset_tokens ("userId", token, expires_at) VALUES ($1, $2, $3)`,
          [user.id, token, expiresAt.toISOString()]
        );
        const transp = import_nodemailer.default.createTransport({ host: process.env.SMTP_HOST || "appapi.therpfoundation.org", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org", pass: process.env.SMTP_PASSWORD || "therpfoundation@321" } });
        await transp.sendMail({
          from: '"RP Foundation" <' + (process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org") + ">",
          to: user.email,
          subject: "Password Reset Request",
          text: `Click here to reset: https://${rpID}/reset-password?token=${token}`
        });
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).json({ error: "Missing username or password" });
    const hash = await import_bcryptjs.default.hash(newPassword, 10);
    await pool2.query(
      `UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin'`,
      [username, hash]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/reset-ticket", async (req, res) => {
  res.json({ success: true, message: "Admin reset ticket created" });
});
app.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool2.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { service_id, signatory_1_name: "Rohit Pandit", signatory_1_designation: "Founder", signatory_2_name: "", signatory_2_designation: "" } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/hq/certificates/signatures", async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body;
    await pool2.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
      signatory_1_name = EXCLUDED.signatory_1_name,
      signatory_1_designation = EXCLUDED.signatory_1_designation,
      signatory_2_name = EXCLUDED.signatory_2_name,
      signatory_2_designation = EXCLUDED.signatory_2_designation
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/hq/certificates/issue", async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body;
    const certId = "RP-" + (/* @__PURE__ */ new Date()).getFullYear() + "-" + Math.floor(1e3 + Math.random() * 9e3);
    const volRes = await pool2.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const realVolId = volRes.rows[0].id;
    const existing = await pool2.query(`SELECT * FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Certificate already issued for this service." });
    const result = await pool2.query(
      `INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`,
      [certId, realVolId, service_id]
    );
    res.json({ success: true, certificate: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/volunteers/me/certificates", async (req, res) => {
  try {
    const { volunteer_id } = req.query;
    const result = await pool2.query(`SELECT * FROM certificates WHERE volunteer_id = $1 ORDER BY issue_date DESC`, [volunteer_id]);
    res.json({ success: true, certificates: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/certificates/verify/:certificate_id", async (req, res) => {
  try {
    const certId = req.params.certificate_id;
    const certRes = await pool2.query(`SELECT * FROM certificates WHERE certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found or invalid." });
    const cert = certRes.rows[0];
    const volRes = await pool2.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];
    res.json({
      success: true,
      data: {
        certificate_id: cert.certificate_id,
        volunteer_name: vol.full_name,
        registration_number: vol.registration_number,
        service_name: cert.service_id.replace(/-/g, " ").toUpperCase(),
        issue_date: cert.issue_date,
        location: `${vol.city}, ${vol.state}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/certificates/download/:id", async (req, res) => {
  try {
    const certId = req.params.id;
    const certRes = await pool2.query(`SELECT * FROM certificates WHERE id = $1 OR certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found" });
    const cert = certRes.rows[0];
    const volRes = await pool2.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];
    let sigs = { signatory_1_name: "Rohit Pandit", signatory_1_designation: "Founder", signatory_2_name: "", signatory_2_designation: "" };
    const sigRes = await pool2.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [cert.service_id]);
    if (sigRes.rows.length > 0) sigs = sigRes.rows[0];
    const pdfDoc = await import_pdf_lib.PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(import_pdf_lib.StandardFonts.HelveticaOblique);
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: (0, import_pdf_lib.rgb)(0.1, 0.3, 0.6), borderWidth: 4 });
    page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: (0, import_pdf_lib.rgb)(0.8, 0.6, 0.2), borderWidth: 2 });
    const logoPath = import_path.default.join(process.cwd(), "public", "assets", "logo.png");
    if (require("fs").existsSync(logoPath)) {
      const logoImageBytes = require("fs").readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      const logoDims = logoImage.scale(0.15);
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - logoDims.height - 35,
        width: logoDims.width,
        height: logoDims.height
      });
    }
    page.drawText("RP FOUNDATION", { x: width / 2 - 120, y: height - 120, size: 30, font, color: (0, import_pdf_lib.rgb)(0.1, 0.2, 0.5) });
    page.drawText("CERTIFICATE OF APPRECIATION", { x: width / 2 - 200, y: height - 160, size: 24, font, color: (0, import_pdf_lib.rgb)(0.8, 0.6, 0.2) });
    page.drawText("CERTIFICATE OF APPRECIATION", { x: width / 2 - 200, y: height - 160, size: 24, font, color: (0, import_pdf_lib.rgb)(0.8, 0.6, 0.2) });
    page.drawText(`Certificate ID: ${cert.certificate_id}`, { x: 50, y: height - 80, size: 10, font: fontNormal });
    page.drawText(`Date: ${new Date(cert.issue_date).toLocaleDateString()}`, { x: width - 150, y: height - 80, size: 10, font: fontNormal });
    page.drawText("This is proudly presented to", { x: width / 2 - 100, y: height - 230, size: 14, font: fontItalic });
    const nameWidth = font.widthOfTextAtSize(vol.full_name, 36);
    page.drawText(vol.full_name, { x: (width - nameWidth) / 2, y: height - 320, size: 36, font, color: (0, import_pdf_lib.rgb)(0.1, 0.1, 0.1) });
    page.drawText(`Reg No: ${vol.registration_number} | ${vol.city}, ${vol.state}`, { x: width / 2 - 120, y: height - 320, size: 12, font: fontNormal });
    page.drawText(`In recognition of their outstanding contribution and dedication to the`, { x: width / 2 - 200, y: height - 400, size: 14, font: fontNormal });
    const serviceName = cert.service_id.replace(/-/g, " ").toUpperCase() + " SERVICE";
    const svcWidth = font.widthOfTextAtSize(serviceName, 18);
    page.drawText(serviceName, { x: (width - svcWidth) / 2, y: height - 400, size: 18, font, color: (0, import_pdf_lib.rgb)(0.1, 0.3, 0.6) });
    page.drawLine({ start: { x: 100, y: 120 }, end: { x: 300, y: 120 }, thickness: 1, color: (0, import_pdf_lib.rgb)(0, 0, 0) });
    page.drawText(sigs.signatory_1_name, { x: 110, y: 100, size: 12, font });
    page.drawText(sigs.signatory_1_designation, { x: 110, y: 85, size: 10, font: fontItalic, color: (0, import_pdf_lib.rgb)(0.3, 0.3, 0.3) });
    if (sigs.signatory_2_name) {
      page.drawLine({ start: { x: width - 300, y: 120 }, end: { x: width - 100, y: 120 }, thickness: 1, color: (0, import_pdf_lib.rgb)(0, 0, 0) });
      page.drawText(sigs.signatory_2_name, { x: width - 290, y: 100, size: 12, font });
      page.drawText(sigs.signatory_2_designation, { x: width - 290, y: 85, size: 10, font: fontItalic, color: (0, import_pdf_lib.rgb)(0.3, 0.3, 0.3) });
    }
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Certificate_${cert.certificate_id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/auth/webauthn/register-options", async (req, res) => {
  const userId = req.query.userId;
  const userResult = await pool2.query(`SELECT username, full_name FROM volunteers WHERE id = $1`, [userId]);
  if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
  const user = userResult.rows[0];
  const options = await (0, import_server.generateRegistrationOptions)({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(userId)),
    userName: user.username,
    userDisplayName: user.full_name,
    attestationType: "none",
    authenticatorSelection: { residentKey: "required", userVerification: "preferred" }
  });
  webAuthnChallengeStore.set(userId, options.challenge);
  res.json(options);
});
app.post("/api/auth/webauthn/register-verify", async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });
  try {
    const verification = await (0, import_server.verifyRegistrationResponse)({
      response,
      expectedChallenge,
      expectedOrigin: originUrl,
      expectedRPID: rpID
    });
    if (verification.verified && verification.registrationInfo) {
      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
      const base64CredID = Buffer.from(credentialID).toString("base64");
      const base64PubKey = Buffer.from(credentialPublicKey).toString("base64");
      await pool2.query(
        `INSERT INTO passkeys ("credentialID", "publicKey", counter, "userId") VALUES ($1, $2, $3, $4)`,
        [base64CredID, base64PubKey, counter, userId]
      );
      webAuthnChallengeStore.delete(userId);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Verification failed" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.post("/api/auth/webauthn/login-options", async (req, res) => {
  const { identifier } = req.body;
  const userResult = await pool2.query(`SELECT id FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`, [identifier]);
  if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
  const userId = userResult.rows[0].id;
  const passkeysResult = await pool2.query(`SELECT "credentialID" FROM passkeys WHERE "userId" = $1`, [userId]);
  const allowCredentials = passkeysResult.rows.map((row) => ({
    id: new Uint8Array(Buffer.from(row.credentialID, "base64")),
    type: "public-key",
    transports: ["internal", "hybrid"]
  }));
  const options = await (0, import_server.generateAuthenticationOptions)({
    rpID,
    allowCredentials,
    userVerification: "preferred"
  });
  webAuthnChallengeStore.set(userId, options.challenge);
  res.json({ options, userId });
});
app.post("/api/auth/webauthn/login-verify", async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });
  try {
    const passkeyResult = await pool2.query(`SELECT * FROM passkeys WHERE "credentialID" = $1 AND "userId" = $2`, [response.id, userId]);
    if (passkeyResult.rows.length === 0) return res.status(404).json({ error: "Passkey not found" });
    const passkey = passkeyResult.rows[0];
    const verification = await (0, import_server.verifyAuthenticationResponse)({
      response,
      expectedChallenge,
      expectedOrigin: originUrl,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(Buffer.from(passkey.credentialID, "base64")),
        credentialPublicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64")),
        counter: Number(passkey.counter)
      }
    });
    if (verification.verified) {
      await pool2.query(`UPDATE passkeys SET counter = $1 WHERE "credentialID" = $2`, [verification.authenticationInfo.newCounter, passkey.credentialID]);
      webAuthnChallengeStore.delete(userId);
      const userResult = await pool2.query(`SELECT * FROM volunteers WHERE id = $1`, [userId]);
      const user = userResult.rows[0];
      res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
    } else {
      res.status(400).json({ error: "Verification failed" });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 300;
var dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL;
var pool2 = new import_pg.default.Pool({
  connectionString: dbUrl,
  ssl: dbUrl && (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.")) ? false : { rejectUnauthorized: false }
});
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY or GOOGLE_SEARCH_API_KEY environment variable is not set. AI Features will use mock mode.");
    }
    aiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
async function queryExternalSearch(searchQuery) {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const targetDomains = [
    "gov.in",
    "nic.in",
    "mp.gov.in",
    "bhaskar.com",
    "jagran.com",
    "ndtv.com",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "wikipedia.org"
  ];
  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1"
  };
  app.get("/api/community_posts", async (req, res) => {
    try {
      const result = await pool2.query('SELECT * FROM community_posts ORDER BY "createdAt" DESC');
      res.json({ data: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/community_posts", async (req, res) => {
    try {
      const { authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt } = req.body;
      const id = import_crypto.default.randomUUID();
      await pool2.query(
        `INSERT INTO community_posts (id, "authorName", "authorPhone", "authorRole", "textEn", "textHi", segment, location, "imageUrl", likes, "likedByMe", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [id, authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt || /* @__PURE__ */ new Date()]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put("/api/community_posts/:id", async (req, res) => {
    try {
      const { likes, likedByMe } = req.body;
      await pool2.query('UPDATE community_posts SET likes = $1, "likedByMe" = $2 WHERE id = $3', [likes, likedByMe, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/support_requests", async (req, res) => {
    try {
      const { citizenName, citizenPhone, requestType, location, description, status, createdAt } = req.body;
      const id = import_crypto.default.randomUUID();
      await pool2.query(
        `INSERT INTO support_requests (id, "citizenName", "citizenPhone", "requestType", location, description, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, citizenName, citizenPhone, requestType, location, description, status, createdAt || /* @__PURE__ */ new Date()]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/sos_alerts", async (req, res) => {
    try {
      const { citizenName, citizenPhone, location, status, createdAt } = req.body;
      const id = import_crypto.default.randomUUID();
      await pool2.query(
        `INSERT INTO sos_alerts (id, "citizenName", "citizenPhone", location, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, citizenName, citizenPhone, location, status, createdAt || /* @__PURE__ */ new Date()]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/scholarships", async (req, res) => {
    try {
      const { studentName, phone, educationLevel, status, createdAt } = req.body;
      const id = import_crypto.default.randomUUID();
      await pool2.query(
        `INSERT INTO scholarships (id, "studentName", phone, "educationLevel", status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, studentName, phone, educationLevel, status, createdAt || /* @__PURE__ */ new Date()]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  if (tavilyKey) {
    try {
      console.log(`[Search/Tier-1/Tavily] Querying: "${searchQuery}"`);
      const response = await import_axios.default.post(
        "https://api.tavily.com/search",
        {
          api_key: tavilyKey,
          query: searchQuery,
          include_domains: targetDomains,
          max_results: 5
        },
        {
          timeout: 4e3
        }
      );
      const items = response.data.results ?? [];
      if (items.length > 0) {
        return items.slice(0, 3).map((item) => {
          let host = "";
          try {
            host = new URL(item.url).hostname;
          } catch {
            host = "tavily.com";
          }
          return {
            title: (item.title ?? "").slice(0, 120),
            link: item.url ?? "",
            url: item.url ?? "",
            snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
            displayLink: host
          };
        });
      }
    } catch (err) {
      console.warn(`[Search/Tier-1/Tavily] Failed: ${err.message}. Cascading to Tier 2...`);
    }
  } else {
    console.warn(`[Search/Tier-1/Tavily] TAVILY_API_KEY is not set. Cascading to Tier 2...`);
  }
  try {
    const constrainedQuery = `${searchQuery} site:gov.in`;
    console.log(`[Search/Tier-2/DDG-Scraper] Querying: "${constrainedQuery}"`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(constrainedQuery)}`;
    const response = await import_axios.default.get(ddgUrl, {
      headers: browserHeaders,
      timeout: 4500
    });
    const $ = cheerio.load(response.data);
    const results = [];
    $(".result").each((_, el) => {
      if (results.length >= 3) return;
      const title = $(el).find(".result__title").text().trim();
      const rawLink = $(el).find(".result__url").attr("href");
      const snippet = $(el).find(".result__snippet").text().trim();
      if (title && rawLink) {
        let link = rawLink;
        if (rawLink.startsWith("//")) {
          link = "https:" + rawLink;
        } else if (rawLink.startsWith("/l/?kh=")) {
          try {
            const urlObj = new URL("https://html.duckduckgo.com" + rawLink);
            const uddg = urlObj.searchParams.get("uddg");
            if (uddg) {
              link = decodeURIComponent(uddg);
            }
          } catch {
          }
        }
        let host = "duckduckgo.com";
        try {
          host = new URL(link).hostname;
        } catch {
        }
        results.push({
          title: title.slice(0, 120),
          link,
          url: link,
          snippet: snippet.replace(/\n/g, " ").slice(0, 260),
          displayLink: host
        });
      }
    });
    if (results.length > 0) {
      return results;
    }
    console.warn(`[Search/Tier-2/DDG-Scraper] No results found or blocked. Cascading to Tier 3...`);
  } catch (err) {
    console.warn(`[Search/Tier-2/DDG-Scraper] Failed: ${err.message}. Cascading to Tier 3...`);
  }
  try {
    console.log(`[Search/Tier-3/SearXNG] Dynamic instance lookup...`);
    const spaceRes = await import_axios.default.get("https://searx.space/data/instances.json", {
      timeout: 3e3
    });
    const instances = spaceRes.data?.instances || {};
    const healthyUrls = [];
    for (const [domain, info] of Object.entries(instances)) {
      const details = info;
      if (details.http?.status_code === 200 && details.uptime?.uptimeDay > 95) {
        const url = domain.startsWith("http") ? domain : `https://${domain}`;
        healthyUrls.push(url.endsWith("/") ? url : url + "/");
      }
    }
    if (healthyUrls.length > 0) {
      for (const instanceUrl of healthyUrls.slice(0, 3)) {
        const searchUrl = `${instanceUrl}search`;
        try {
          console.log(`[Search/Tier-3/SearXNG] Trying instance: ${searchUrl}`);
          const res = await import_axios.default.get(searchUrl, {
            params: {
              q: `${searchQuery} site:gov.in`,
              format: "json"
            },
            headers: browserHeaders,
            timeout: 3500
          });
          if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
            const items = res.data.results || [];
            if (items.length > 0) {
              return items.slice(0, 3).map((item) => {
                let host = "searxng.org";
                try {
                  host = new URL(item.url).hostname;
                } catch {
                }
                return {
                  title: (item.title ?? "").slice(0, 120),
                  link: item.url ?? "",
                  url: item.url ?? "",
                  snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
                  displayLink: host
                };
              });
            }
          }
        } catch (err) {
          console.warn(`[Search/Tier-3/SearXNG] Instance ${searchUrl} failed: ${err.message}`);
        }
      }
    }
    console.warn(`[Search/Tier-3/SearXNG] Cluster search failed or rate-limited. Cascading to Tier 4...`);
  } catch (err) {
    console.warn(`[Search/Tier-3/SearXNG] Dynamic discovery failed: ${err.message}. Cascading to Tier 4...`);
  }
  try {
    console.log(`[Search/Tier-4/Wikipedia] Querying: "${searchQuery}"`);
    const wikiUrl = "https://en.wikipedia.org/w/api.php";
    const res = await import_axios.default.get(wikiUrl, {
      params: {
        action: "query",
        list: "search",
        srsearch: searchQuery,
        format: "json",
        utf8: 1,
        origin: "*"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      },
      timeout: 4e3
    });
    const items = res.data?.query?.search || [];
    if (items.length > 0) {
      return items.slice(0, 3).map((item) => ({
        title: item.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: (item.snippet ?? "").replace(/<span class="searchmatch">/g, "").replace(/<\/span>/g, "").slice(0, 260),
        displayLink: "en.wikipedia.org"
      }));
    }
  } catch (err) {
    console.error("[Search/Tier-4/Wikipedia] Failed completely:", err.message);
  }
  return [];
}
async function handleOfflineFallback(message, language, res) {
  const query = message.toLowerCase();
  const hasDevanagari = /[\u0900-\u097F]/.test(message);
  const commonHinglish = ["kya", "hai", "kaise", "kab", "karo", "naam", "sewa", "chahiye", "chal", "raha", "hoga", "apna", "banao", "madad", "namaste", "namaskar", "aaj"];
  const isHinglish = commonHinglish.some((word) => query.includes(word));
  const isHi = language === "hi" || hasDevanagari || isHinglish;
  if (query.includes("aaj") || query.includes("today") || query.includes("kya chal") || query.includes("status") || query.includes("whats up")) {
    const reply = isHi ? "\u0928\u092E\u0938\u094D\u0924\u0947! \u0906\u091C \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u0947 \u0924\u0939\u0924 **\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0938\u0902\u0930\u0915\u094D\u0937\u0923 \u0905\u092D\u093F\u092F\u093E\u0928**, **\u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u091C\u093E\u0902\u091A \u0936\u093F\u0935\u093F\u0930**, \u0914\u0930 **\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921 \u092A\u0902\u091C\u0940\u0915\u0930\u0923** \u0915\u0940 \u0938\u0947\u0935\u093E\u090F\u0902 \u0938\u0915\u094D\u0930\u093F\u092F \u0930\u0942\u092A \u0938\u0947 \u091A\u0932 \u0930\u0939\u0940 \u0939\u0948\u0902\u0964 \u0906\u092A \u0907\u0928\u092E\u0947\u0902 \u0938\u0947 \u0915\u093F\u0938 \u0938\u0947\u0935\u093E \u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0928\u093E \u091A\u093E\u0939\u0924\u0947 \u0939\u0948\u0902?" : "Hello! Today at the RP Foundation, our **Environment Protection Drive**, **Free Health Checkup Camps**, and **Jan Seva Card Registrations** are actively running. Which service would you like to know more about?";
    return res.json({ response: reply });
  }
  if (query.includes("motive") || query.includes("purpose") || query.includes("dhyey") || query.includes("aim") || query.includes("rp") && query.includes("kya") || query.includes("foundation") && query.includes("kya")) {
    const reply = isHi ? "**\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 (RP Foundation)** \u090F\u0915 \u0917\u0948\u0930-\u0938\u0930\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 (NGO) \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0932\u094D\u092F\u093E\u0923, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0938\u0939\u093E\u092F\u0924\u093E, \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0936\u093F\u0915\u094D\u0937\u093E \u0938\u0939\u092F\u094B\u0917, \u0938\u093E\u092E\u0941\u0926\u093E\u092F\u093F\u0915 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u093E \u0914\u0930 \u0921\u093F\u091C\u093F\u091F\u0932 \u0938\u0936\u0915\u094D\u0924\u093F\u0915\u0930\u0923 (\u091C\u0948\u0938\u0947 \u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921) \u0915\u0947 \u0932\u093F\u090F \u0938\u092E\u0930\u094D\u092A\u093F\u0924 \u0939\u0948\u0964 \u0939\u092E\u093E\u0930\u093E \u0927\u094D\u092F\u0947\u092F **'\u0938\u0947\u0935\u093E, \u0938\u092E\u0930\u094D\u092A\u0923, \u0938\u0902\u0915\u0932\u094D\u092A'** \u0939\u0948\u0964" : "**RP Foundation** is a non-governmental organization (NGO) dedicated to social welfare, healthcare assistance, educational support, community volunteering, and digital empowerment (such as the Jan Seva Card). Our motto is **'Service, Dedication, Resolve'**.";
    return res.json({ response: reply });
  }
  if (query.includes("founder") || query.includes("sanchalak") || query.includes("kisne banaya") || query.includes("founder kon") || query.includes("rohit")) {
    const reply = isHi ? "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 (RP Foundation) \u0915\u0947 \u0938\u0902\u0938\u094D\u0925\u093E\u092A\u0915 **\u0930\u094B\u0939\u093F\u0924 \u092A\u0902\u0921\u093F\u0924** (\u0930\u094B\u0939\u093F\u0924 \u0938\u0930) \u0939\u0948\u0902\u0964 \u0909\u0928\u0915\u0947 \u0928\u0947\u0924\u0943\u0924\u094D\u0935 \u092E\u0947\u0902 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0938\u092E\u093E\u091C \u0915\u0947 \u0917\u0930\u0940\u092C \u0914\u0930 \u092A\u093F\u091B\u0921\u093C\u0947 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u0940 \u0938\u0939\u093E\u092F\u0924\u093E \u0915\u0947 \u0932\u093F\u090F \u0915\u0908 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0902 \u091A\u0932\u093E \u0930\u0939\u093E \u0939\u0948\u0964" : "RP Foundation was founded by **Rohit Pandit** (Rohit Sir). Under his guidance, the foundation carries out multiple community welfare programs, health camps, and free education drives.";
    return res.json({ response: reply });
  }
  if (query.includes("card") || query.includes("\u0915\u093E\u0930\u094D\u0921") || query.includes("jan seva") || query.includes("\u091C\u0928 \u0938\u0947\u0935\u093E")) {
    const reply = isHi ? "**\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921** \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u093E \u0906\u092A\u0915\u093E digital identity pass \u0939\u0948\u0964\n\n\u{1F4CB} **\u0906\u0935\u0947\u0926\u0928 \u0915\u0947 \u091A\u0930\u0923:**\n1. Go to *Services \u2192 Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy.\n4. Once approved, download your QR-enabled digital pass." : "**Jan Seva Card** is your digital identity pass from RP Foundation.\n\n\u{1F4CB} **Steps to Apply:**\n1. Go to *Services \u2192 Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy \u2014 never stored as plain text.\n4. Once approved, download your QR-enabled digital pass.";
    return res.json({ response: reply });
  }
  if (query.includes("blood") || query.includes("\u0930\u0915\u094D\u0924") || query.includes("\u092C\u094D\u0932\u0921") || query.includes("donor")) {
    const reply = isHi ? "**\u0930\u0915\u094D\u0924 \u0928\u0947\u091F\u0935\u0930\u094D\u0915 (Blood Network)** \u2014 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u092F\u093E \u0938\u094D\u0935\u0948\u091A\u094D\u091B\u093F\u0915 \u0930\u0915\u094D\u0924\u0926\u093E\u0928\u0964\n\n\u{1FA78} **\u0930\u0915\u094D\u0924 \u0905\u0928\u0941\u0930\u094B\u0927:** \u0906\u0935\u0936\u094D\u092F\u0915 \u0917\u094D\u0930\u0941\u092A, \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u0915\u093E \u0928\u093E\u092E \u0914\u0930 \u092F\u0942\u0928\u093F\u091F \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964\n\u{1FA78} **\u0930\u0915\u094D\u0924\u0926\u093E\u0924\u093E \u092A\u0902\u091C\u0940\u0915\u0930\u0923:** \u092C\u094D\u0932\u0921 \u091F\u093E\u0907\u092A \u0914\u0930 \u0905\u0902\u0924\u093F\u092E \u0926\u093E\u0928 \u0924\u093F\u0925\u093F \u0938\u092C\u092E\u093F\u091F \u0915\u0930\u0947\u0902\u0964" : "**Blood Network** \u2014 Emergency or voluntary blood donation.\n\n\u{1FA78} **Request Blood:** Post your required group, hospital name and units needed.\n\u{1FA78} **Register as Donor:** Submit blood type, last donation date.";
    return res.json({ response: reply });
  }
  if (query.includes("volunteer") || query.includes("\u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915") || query.includes("seva")) {
    const reply = isHi ? "**RP Foundation \u092E\u0947\u0902 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915 \u092C\u0928\u0947\u0902\u0964**\n\n\u{1F91D} **\u0915\u0948\u0938\u0947 \u091C\u0941\u0921\u093C\u0947\u0902:**\n1. *\u0938\u0947\u0935\u093E\u090F\u0902 \u2192 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915 \u0905\u0935\u0938\u0930* \u092A\u0930 \u091C\u093E\u090F\u0902\u0964\n2. \u0915\u094C\u0936\u0932 \u0936\u094D\u0930\u0947\u0923\u0940 \u091A\u0941\u0928\u0947\u0902: \u0936\u093F\u0915\u094D\u0937\u0923, IT, \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0915\u093E\u0930\u094D\u092F, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F\u0964\n3. \u0938\u092A\u094D\u0924\u093E\u0939\u093E\u0902\u0924 \u0905\u092D\u093F\u092F\u093E\u0928\u094B\u0902, \u092D\u094B\u091C\u0928 \u0936\u093F\u0935\u093F\u0930\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0938\u093E\u0907\u0928 \u0905\u092A \u0915\u0930\u0947\u0902\u0964" : "**Volunteer Opportunities** at RP Foundation.\n\n\u{1F91D} **How to Join:**\n1. Go to *Services \u2192 Volunteer Opportunities*.\n2. Choose a skill: Teaching, IT, Field Work, Healthcare.\n3. Sign up for weekend drives, food camps, plantation events.";
    return res.json({ response: reply });
  }
  if (query.includes("donate") || query.includes("\u0926\u093E\u0928") || query.includes("donation")) {
    const reply = isHi ? "**\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u094B \u0926\u093E\u0928 \u0915\u0930\u0947\u0902** \u2014 \u0906\u092A\u0915\u093E \u092F\u094B\u0917\u0926\u093E\u0928 \u091C\u0940\u0935\u0928 \u092C\u0926\u0932\u0924\u093E \u0939\u0948\u0964\n\n\u{1F49B} **\u0924\u094D\u0935\u0930\u093F\u0924 \u0935\u093F\u0915\u0932\u094D\u092A:** \u20B9500 / \u20B91000 / \u20B95000 \u092F\u093E \u0915\u0938\u094D\u091F\u092E \u0930\u093E\u0936\u093F\u0964\n\u{1F4DC} **80G \u0938\u0930\u094D\u091F\u093F\u092B\u093F\u0915\u0947\u091F:** \u0938\u094D\u0935\u0924: \u0928\u093F\u0930\u094D\u092E\u093F\u0924 \u0915\u0930-\u091B\u0942\u091F PDF\u0964" : "**Donate to RP Foundation** \u2014 Your contribution changes lives.\n\n\u{1F49B} **Quick options:** \u20B9500 / \u20B91000 / \u20B95000 or a custom amount.\n\u{1F4DC} **80G Certificate:** Auto-generated tax-exemption PDF.";
    return res.json({ response: reply });
  }
  try {
    const results = await queryExternalSearch(message);
    if (results && results.length > 0) {
      let reply = isHi ? "\u092E\u0941\u091D\u0947 \u0907\u0938\u0915\u0947 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u0935\u0947\u092C \u0938\u0947 \u092F\u0947 \u092A\u0930\u093F\u0923\u093E\u092E \u092E\u093F\u0932\u0947 \u0939\u0948\u0902:\n\n" : "I found the following results from the web:\n\n";
      results.forEach((r) => {
        reply += `\u{1F517} **[${r.title}](${r.link})**
${r.snippet}

`;
      });
      return res.json({ response: reply });
    }
  } catch (e) {
  }
  const defaultReply = isHi ? "\u0928\u092E\u0938\u094D\u0924\u0947! \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0916\u094B\u091C \u092E\u0947\u0902 \u0938\u0939\u093E\u092F\u0924\u093E \u0915\u0930\u0928\u0947 \u0915\u0940 \u0915\u094B\u0936\u093F\u0936 \u0915\u0930 \u0930\u0939\u093E \u0939\u0942\u0901\u0964 \u0905\u0927\u093F\u0915 \u0935\u093F\u0936\u093F\u0937\u094D\u091F \u092A\u094D\u0930\u0936\u094D\u0928 \u092A\u0942\u091B\u0947\u0902 (\u091C\u0948\u0938\u0947 '\u091C\u0928 \u0938\u0947\u0935\u093E \u0915\u093E\u0930\u094D\u0921 \u0915\u0948\u0938\u0947 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902' \u092F\u093E '\u0930\u0915\u094D\u0924\u0926\u093E\u0928 \u0915\u0948\u0938\u0947 \u0915\u0930\u0947\u0902') \u092F\u093E \u0939\u092E\u093E\u0930\u0940 \u0939\u0947\u0932\u094D\u092A\u0932\u093E\u0907\u0928 **1800-569-0991** \u092A\u0930 \u0915\u0949\u0932 \u0915\u0930\u0947\u0902\u0964" : "Hello! I am trying to assist you with your search. Please ask a more specific question (e.g. 'how to get jan seva card' or 'how to donate blood') or call our helpline at **1800-569-0991**.";
  return res.json({ response: defaultReply });
}
app.post("/api/ai/chat", async (req, res) => {
  const { message, history = [], language = "hi" } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
  if (!apiKey || apiKey === "MOCK_KEY") {
    return handleOfflineFallback(message, language, res);
  }
  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are "RP Foundation AI Mitr" (\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0906\u0908 \u092E\u093F\u0924\u094D\u0930), a friendly and general-purpose AI assistant.
You can answer any general questions, solve math problems, write text, explain concepts, or translate languages just like Gemini, ChatGPT, or Grok, while maintaining your identity as RP AI Mitr.
When asked about RP Foundation, guide them about its initiatives (Jan Seva Card, blood donation, volunteer opportunities, government schemes).
Always match the user's language preference (Hindi, English, or Hinglish) and keep responses clear, concise, and helpful.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.-flash",
      contents: [
        { role: "user", parts: [{ text: `System instruction: ${systemPrompt}` }] },
        ...history.map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });
    const replyText = response.text || "Sorry, I am unable to process that right now.";
    return res.json({ response: replyText });
  } catch (error) {
    console.error("Gemini Chat Error, falling back:", error);
    return handleOfflineFallback(message, language, res);
  }
});
app.post("/api/ai/categorize", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  const safeCatDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };
  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeCatDefault);
  }
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.-flash",
      contents: `You are an auto-triage AI for RP Foundation's Grievance Redressal system. Your task is to categorize citizens' complaints.
Analyze the following title and description of a complaint, and return a JSON object with:
1. "category": strictly one of ["Water Supply", "Roads & Transit", "Sanitation & Waste", "Education & Schools", "Healthcare Facilities", "Street Lights & Power", "Others"]
2. "urgency": strictly one of ["Low", "Medium", "High", "Critical"]
3. "summary": a single compact summary line (in Hindi if complaint is in Hindi, otherwise English).

Complaint Title: "${title}"
Complaint Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            category: { type: import_genai.Type.STRING },
            urgency: { type: import_genai.Type.STRING },
            summary: { type: import_genai.Type.STRING }
          },
          required: ["category", "urgency", "summary"]
        }
      }
    });
    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI Categorization Error:", error);
    res.json(safeCatDefault);
  }
});
app.post("/api/ai/scheme-match", async (req, res) => {
  const { age, gender, annualIncome, occupation, state, category } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  const safeSchemeDefault = { schemes: [] };
  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeSchemeDefault);
  }
  try {
    const ai = getGeminiClient();
    const prompt = `Formulate custom recommended Indian Government Schemes or RP Foundation scholarships for a citizen with the following details:
- Age: ${age}
- Gender: ${gender}
- Annual Income: \u20B9${annualIncome}
- Occupation: ${occupation}
- State: ${state}
- Social Category/Work: ${category}

Respond with a JSON array of up to 3 highly tailored schemes. Each scheme should contain:
1. "name" (Scheme/Scholarship name in Bilingual format e.g. "Ayushman Bharat / \u0906\u092F\u0941\u0937\u094D\u092E\u093E\u0928 \u092D\u093E\u0930\u0924")
2. "eligibility" (Why they are eligible)
3. "benefits" (Key benefits)
4. "steps" (Simple steps to apply)`;
    const response = await ai.models.generateContent({
      model: "gemini-2.-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              name: { type: import_genai.Type.STRING },
              eligibility: { type: import_genai.Type.STRING },
              benefits: { type: import_genai.Type.STRING },
              steps: { type: import_genai.Type.STRING }
            },
            required: ["name", "eligibility", "benefits", "steps"]
          }
        }
      }
    });
    const schemes = JSON.parse(response.text || "[]");
    res.json({ schemes });
  } catch (error) {
    console.error("Scheme Matcher Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze schemes" });
  }
});
var acGeoJsonData = null;
app.get("/api/locations/search", (req, res) => {
  const query = req.query.q?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json([]);
  }
  if (!acGeoJsonData) {
    try {
      const geoJsonPath = import_path.default.join(process.cwd(), "maps-master", "maps-master", "website", "docs", "data", "geojson", "ac.geojson");
      const fileContent = import_fs.default.readFileSync(geoJsonPath, "utf-8");
      acGeoJsonData = JSON.parse(fileContent);
    } catch (err) {
      console.error("Failed to load ac.geojson:", err);
      return res.status(500).json({ error: "Location data unavailable" });
    }
  }
  const results = [];
  const seen = /* @__PURE__ */ new Set();
  const features = acGeoJsonData.features || [];
  for (const feature of features) {
    const props = feature.properties;
    if (props && props.ST_NAME === "MADHYA PRADESH") {
      const dist = (props.DIST_NAME || "").toLowerCase();
      const ac = (props.AC_NAME || "").toLowerCase();
      if (dist.includes(query) || ac.includes(query)) {
        const uniqueKey = `${props.DIST_NAME}-${props.AC_NAME}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          results.push({
            district: props.DIST_NAME,
            vidhan_sabha: props.AC_NAME,
            sansad_kshetra: props.PC_NAME
          });
        }
      }
    }
    if (results.length >= 10) break;
  }
  res.json(results);
});
app.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001b3bed380e8e94e615b9d89710cdd46f0";
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";
  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
      if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
      if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
      const response = await import_axios.default.get(url, { timeout: 5e3 });
      return res.json(response.data);
    } catch (err) {
      console.error("Mandi Prices API failed, falling back to mock");
    }
  }
  res.json({
    status: "ok",
    total: 3,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", market: "Bhopal (F&V)", commodity: commodity || "Wheat", min_price: "2200", max_price: "2450", modal_price: "2350", arrival_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] },
      { state: state || "Madhya Pradesh", district: "Sehore", market: "Sehore", commodity: commodity || "Soyabean", min_price: "4200", max_price: "4600", modal_price: "4500", arrival_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] }
    ]
  });
});
app.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001b3bed380e8e94e615b9d89710cdd46f0";
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428";
  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
      if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
      if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
      const response = await import_axios.default.get(url, { timeout: 5e3 });
      return res.json(response.data);
    } catch (err) {
      console.error("Hospitals API failed, falling back to mock");
    }
  }
  res.json({
    status: "ok",
    total: 2,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "Hamidia Hospital", type: "District Hospital", address: "Royal Market Road", pincode: "462001", mobile_number: "0755-2540141" },
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "AIIMS Bhopal", type: "Super Specialty", address: "Saket Nagar", pincode: "462020", mobile_number: "0755-2672322" }
    ]
  });
});
async function initDatabase() {
  let client;
  try {
    console.log("Initializing local PostgreSQL schema...");
    client = await pool2.connect();
    const tablesToRecreate = ["social_posts", "campaigns", "jobs", "health_camps", "grievances", "service_submissions", "job_applications", "blood_donors", "card_applications"];
    for (const table of tablesToRecreate) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        points INTEGER DEFAULT 0,
        badges INTEGER DEFAULT 0,
        "janSevaCardStatus" TEXT DEFAULT 'none',
        "janSevaCardNo" TEXT DEFAULT '',
        "isVolunteer" BOOLEAN DEFAULT false,
        "isDonor" BOOLEAN DEFAULT false,
        "onboardingCompleted" BOOLEAN DEFAULT false,
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(255) PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          role TEXT DEFAULT 'citizen',
          "tollFree" TEXT,
          "webUrl" TEXT,
          "founderMessageEn" TEXT,
          "founderMessageHi" TEXT
        )
      `);
    try {
      await pool2.query("ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)");
    } catch (e) {
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        author TEXT,
        role TEXT,
        avatar TEXT,
        "textEn" TEXT,
        "textHi" TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        "commentsCount" INTEGER DEFAULT 0,
        liked BOOLEAN DEFAULT false,
        platform TEXT,
        link TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "goalAmount" NUMERIC DEFAULT 0,
        "raisedAmount" NUMERIC DEFAULT 0,
        "imageUrl" TEXT,
        "coverImgUrl" TEXT,
        urgent BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        company TEXT,
        "locEn" TEXT,
        "locHi" TEXT,
        salary TEXT,
        "typeEn" TEXT,
        "typeHi" TEXT,
        "postedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_camps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "dateEn" TEXT,
        "dateHi" TEXT,
        "locationEn" TEXT,
        "locationHi" TEXT,
        contact TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE OR REPLACE VIEW camps AS 
      SELECT * FROM health_camps
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS grievances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        description TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        "reportedBy" TEXT,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        "aiSummary" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        "serviceNameEn" TEXT,
        "serviceName" TEXT,
        "citizenName" TEXT,
        "citizenPhone" TEXT,
        "submissionData" TEXT,
        status TEXT DEFAULT 'pending',
        latitude NUMERIC,
        longitude NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      DROP TABLE IF EXISTS volunteers CASCADE;
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        mobile VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS card_applications (
        "userId" VARCHAR(255) PRIMARY KEY,
        name TEXT,
        gender TEXT,
        dob TEXT,
        address TEXT,
        "idType" TEXT,
        "idNumber" TEXT,
        status TEXT DEFAULT 'pending',
        "cardNo" TEXT DEFAULT '',
        "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    const postsCount = await client.query("SELECT COUNT(*) FROM social_posts");
    if (parseInt(postsCount.rows[0].count, 10) === 0) {
      console.log("Seeding default social_posts into PostgreSQL...");
      const DEFAULT_POSTS = [
        {
          author: "Rohit Pandit",
          role: "Founder, RP Foundation",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
          textEn: "Sharing highlights from our weekend tree plantation drive in Karond, Bhopal. Over 500 saplings planted! \u{1F333} Let's build a greener tomorrow.",
          textHi: "\u0915\u0930\u094C\u0902\u0926, \u092D\u094B\u092A\u093E\u0932 \u092E\u0947\u0902 \u0939\u092E\u093E\u0930\u0947 \u0938\u092A\u094D\u0924\u093E\u0939\u093E\u0902\u0924 \u0935\u0943\u0915\u094D\u0937\u093E\u0930\u094B\u092A\u0923 \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u0915\u0941\u091B \u091D\u0932\u0915\u093F\u092F\u093E\u0901\u0964 500 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092A\u094C\u0927\u0947 \u0932\u0917\u093E\u090F \u0917\u090F! \u{1F333} \u0906\u0907\u090F \u090F\u0915 \u0939\u0930\u093F\u0924 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0947\u0902\u0964",
          image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
          likes: 412,
          commentsCount: 18,
          liked: false,
          platform: "instagram",
          link: "https://www.instagram.com/therohitpandit/"
        },
        {
          author: "RP Foundation",
          role: "Official Page",
          avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
          textEn: "Successful free eye checkup camp conducted today at Sehore district. Over 200 patients received free consultations and medicines. \u{1FA7A}\u{1F499}",
          textHi: "\u0938\u0940\u0939\u094B\u0930 \u091C\u093F\u0932\u093E \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092E\u0947\u0902 \u0906\u091C \u0938\u092B\u0932 \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u0928\u0947\u0924\u094D\u0930 \u091C\u093E\u0902\u091A \u0936\u093F\u0935\u093F\u0930 \u0906\u092F\u094B\u091C\u093F\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E\u0964 200 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092E\u0930\u0940\u091C\u094B\u0902 \u0915\u094B \u0928\u093F\u0903\u0936\u0941\u0932\u094D\u0915 \u092A\u0930\u093E\u092E\u0930\u094D\u0936 \u0914\u0930 \u0926\u0935\u093E\u090F\u0902 \u0926\u0940 \u0917\u0908\u0902\u0964 \u{1FA7A}\u{1F499}",
          image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
          likes: 580,
          commentsCount: 34,
          liked: false,
          platform: "facebook",
          link: "https://www.facebook.com/rpfofficial"
        }
      ];
      for (const p of DEFAULT_POSTS) {
        await client.query(
          `INSERT INTO social_posts (author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
        );
      }
    }
    console.log("PostgreSQL schema initialization completed successfully.");
  } catch (err) {
    console.error("Database connection or schema init error (non-fatal):", err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
}
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "appapi.therpfoundation.org",
  port: 465,
  secure: true,
  // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org",
    pass: process.env.SMTP_PASSWORD || "therpfoundation@321"
  }
});
app.post("/api/auth/login-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email" });
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    await pool2.query(`
        CREATE TABLE IF NOT EXISTS otps (
          phone VARCHAR(255) PRIMARY KEY,
          otp VARCHAR(10) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    await pool2.query(
      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
      [email, otp]
    );
    console.log(`[EMAIL] Sending OTP for ${email} is: ${otp}`);
    await transporter.sendMail({
      from: '"RP Foundation" <' + (process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org") + ">",
      to: email,
      subject: "Your Jan Seva Login OTP",
      text: `Your OTP for RP Foundation Jan Seva is: ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">${otp}</span></b><br/><p>It is valid for 10 minutes.</p>`
    });
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool2.query(
      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
      [phone, otp]
    );
    console.log(`
  ===============================
  [SMS] Sending OTP for ${phone} is: ${otp}
  ===============================
  `);
    try {
      const MSG91_AUTHKEY = "552233Aul3uTNSZ6a5de34bP1";
      const MSG91_SENDER = "RPFApp";
      const url = `https://control.msg91.com/api/v5/otp?authkey=${MSG91_AUTHKEY}&mobile=91${phone}&otp=${otp}&sender=${MSG91_SENDER}`;
      const axios2 = require("axios");
      await axios2.get(url);
    } catch (smsErr) {
      console.error("MSG91 Error:", smsErr?.response?.data || smsErr.message);
    }
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const result = await pool2.query("SELECT * FROM otps WHERE phone = $1 AND otp = $2", [phone, otp]);
    if (result.rows.length > 0) {
      await pool2.query("DELETE FROM otps WHERE phone = $1", [phone]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt" FROM jobs ORDER BY "postedAt" DESC'
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/jobs", async (req, res) => {
  try {
    const { titleEn, titleHi, locEn, locHi, salary, typeEn, typeHi, company } = req.body;
    const id = import_crypto.default.randomUUID();
    const result = await pool2.query(
      `INSERT INTO jobs 
       (id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        id,
        titleEn,
        titleHi,
        company,
        locEn,
        locHi,
        salary,
        typeEn,
        typeHi,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM jobs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/jobs/:id/edit", async (req, res) => {
  try {
    const { titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi } = req.body;
    await pool2.query(
      `UPDATE jobs SET 
       "titleEn" = $1, "titleHi" = $2, company = $3, "locEn" = $4, "locHi" = $5, 
       salary = $6, "typeEn" = $7, "typeHi" = $8 
       WHERE id = $9`,
      [titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/grievances", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "createdAt" FROM grievances ORDER BY "createdAt" DESC'
    );
    res.json({ grievances: result.rows });
  } catch (error) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/grievances", async (req, res) => {
  try {
    const { title, description, category, urgency, location, reportedBy, status, date, aiSummary } = req.body;
    const id = import_crypto.default.randomUUID();
    const result = await pool2.query(
      `INSERT INTO grievances 
       (id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id`,
      [
        id,
        title,
        description,
        category,
        urgency,
        location,
        reportedBy,
        status || "Pending",
        date || (/* @__PURE__ */ new Date()).toLocaleDateString(),
        aiSummary || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error("Error creating grievance:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/grievances/status", async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool2.query("UPDATE grievances SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/grievances/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM grievances WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications'
    );
    res.json({ applications: result.rows });
  } catch (error) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cards", async (req, res) => {
  try {
    const { userId, name, gender, dob, address, idType, idNumber, status } = req.body;
    const submittedAt = (/* @__PURE__ */ new Date()).toISOString();
    await pool2.query(
      `INSERT INTO card_applications 
       ("userId", name, gender, dob, address, "idType", "idNumber", status, "submittedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       ON CONFLICT ("userId") DO UPDATE SET 
       name = $2, gender = $3, dob = $4, address = $5, "idType" = $6, "idNumber" = $7, status = $8, "submittedAt" = $9`,
      [
        userId,
        name,
        gender,
        dob,
        address,
        idType,
        idNumber,
        status || "pending",
        submittedAt
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cards/approve", async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `JSC-${Math.floor(1e7 + Math.random() * 9e7)}`;
    await pool2.query(
      'UPDATE card_applications SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
      ["approved", cardNo, userId]
    );
    await pool2.query(
      'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
      ["approved", cardNo, userId]
    );
    res.json({ success: true, cardNo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cards/reject", async (req, res) => {
  try {
    const { userId } = req.body;
    await pool2.query(
      'UPDATE card_applications SET status = $1 WHERE "userId" = $2',
      ["rejected", userId]
    );
    await pool2.query(
      'UPDATE users SET "janSevaCardStatus" = $1 WHERE id = $2',
      ["rejected", userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/cards/:userId", async (req, res) => {
  try {
    await pool2.query('DELETE FROM card_applications WHERE "userId" = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.use("/api/admin/hq", adminHqRoutes_default);
app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool2.query("SELECT * FROM settings WHERE id = $1", ["general"]);
    if (result.rows.length > 0) {
      res.json({ settings: result.rows[0] });
    } else {
      const defaults = {
        id: "general",
        tollFree: "1800 - 569 - 0991",
        webUrl: "www.therpfoundation.org",
        email: "info@therpfoundation.org",
        founderMessageEn: "Our mission is simple \u2013 to serve humanity with sincerity, build strong communities, and create a better tomorrow for India.",
        founderMessageHi: "\u0939\u092E\u093E\u0930\u093E \u0909\u0926\u094D\u0926\u0947\u0936\u094D\u092F \u0938\u0930\u0932 \u0939\u0948 - \u0928\u093F\u0937\u094D\u0920\u093E \u0915\u0947 \u0938\u093E\u0925 \u092E\u093E\u0928\u0935\u0924\u093E \u0915\u0940 \u0938\u0947\u0935\u093E \u0915\u0930\u0928\u093E, \u092E\u091C\u092C\u0942\u0924 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u093E \u0914\u0930 \u092D\u093E\u0930\u0924 \u0915\u0947 \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u093E\u0964"
      };
      await pool2.query(
        'INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi") VALUES ($1, $2, $3, $4, $5, $6)',
        [defaults.id, defaults.tollFree, defaults.webUrl, defaults.email, defaults.founderMessageEn, defaults.founderMessageHi]
      );
      res.json({ settings: defaults });
    }
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/settings", async (req, res) => {
  try {
    const { tollFree, webUrl, email, founderMessageEn, founderMessageHi } = req.body;
    await pool2.query(
      `INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi") 
       VALUES ('general', $1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET 
       "tollFree" = $1, "webUrl" = $2, email = $3, "founderMessageEn" = $4, "founderMessageHi" = $5`,
      [tollFree, webUrl, email, founderMessageEn, founderMessageHi]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/cms", async (req, res) => {
  try {
    const result = await pool2.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      let parsed = JSON.parse(result.rows[0].founderMessageEn);
      let modified = false;
      if (!parsed.faqs) {
        parsed.faqs = [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0906\u0908\u0921\u0940 \u0915\u093E\u0930\u094D\u0921 \u0915\u094D\u092F\u093E \u0939\u0948?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "\u092F\u0939 \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u092F\u093E \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u090F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u093E\u0930\u094D\u0921 \u0939\u0948, \u091C\u093F\u0938\u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u092A \u0938\u092D\u0940 21 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0938\u0947\u0935\u093E\u0913\u0902 \u0915\u093E \u0932\u093E\u092D \u0938\u0930\u0932\u0924\u093E \u0938\u0947 \u0909\u0920\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "\u0915\u093E\u0930\u094D\u0921 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "\u0906\u0935\u0947\u0926\u0928 \u091C\u092E\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0940\u092E \u0906\u092A\u0915\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0924\u0940 \u0939\u0948 \u0914\u0930 \u0938\u093E\u0927\u093E\u0930\u0923\u0924\u0903 2 \u0938\u0947 3 \u0915\u093E\u0930\u094D\u092F \u0926\u093F\u0935\u0938\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0947 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "\u0938\u092D\u0940 \u0928\u093E\u0917\u0930\u093F\u0915 \u0936\u093F\u0915\u093E\u092F\u0924\u094B\u0902 \u0915\u094B \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0938\u0940\u0927\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0915\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u091C\u094B 48 \u0938\u0947 72 \u0918\u0902\u091F\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964"
          }
        ];
        modified = true;
      }
      if (!parsed.aboutTextEn) {
        parsed.aboutTextEn = "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.";
        parsed.aboutTextHi = "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0915 \u0917\u0948\u0930-\u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0947 \u0915\u092E\u091C\u094B\u0930 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u0947, \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u093E\u0917\u0930\u093F\u0915 \u0930\u093E\u0939\u0924 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u0939\u0948\u0964";
        parsed.logoImgUrl = "/assets/logo.png";
        modified = true;
      }
      if (modified) {
        await pool2.query(
          'UPDATE settings SET "founderMessageEn" = $1 WHERE id = $2',
          [JSON.stringify(parsed), "cms_data"]
        );
      }
      return res.json({ success: true, cms: parsed });
    } else {
      const defaults = {
        alertBannerEn: "",
        alertBannerHi: "",
        founderName: "Rohit Pandit",
        founderDesignation: "Founder, RP Foundation",
        founderImgUrl: "/assets/founder.png",
        aboutTextEn: "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.",
        aboutTextHi: "\u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u090F\u0915 \u0917\u0948\u0930-\u0932\u093E\u092D\u0915\u093E\u0930\u0940 \u0938\u0902\u0917\u0920\u0928 \u0939\u0948 \u091C\u094B \u0938\u092E\u093E\u091C \u0915\u0947 \u0915\u092E\u091C\u094B\u0930 \u0935\u0930\u094D\u0917\u094B\u0902 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u0947, \u0936\u093F\u0915\u094D\u0937\u093E, \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F, \u0914\u0930 \u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0928\u093E\u0917\u0930\u093F\u0915 \u0930\u093E\u0939\u0924 \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092A\u094D\u0930\u0924\u093F\u092C\u0926\u094D\u0927 \u0939\u0948\u0964",
        logoImgUrl: "/assets/logo.png",
        faqs: [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "\u091C\u0928 \u0938\u0947\u0935\u093E \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0906\u0908\u0921\u0940 \u0915\u093E\u0930\u094D\u0921 \u0915\u094D\u092F\u093E \u0939\u0948?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "\u092F\u0939 \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936 \u0915\u0947 \u0928\u093E\u0917\u0930\u093F\u0915\u094B\u0902 \u0915\u0947 \u0932\u093F\u090F \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0926\u094D\u0935\u093E\u0930\u093E \u092A\u094D\u0930\u0926\u093E\u0928 \u0915\u093F\u092F\u093E \u091C\u093E\u0928\u0947 \u0935\u093E\u0932\u093E \u090F\u0915 \u0921\u093F\u091C\u093F\u091F\u0932 \u0915\u093E\u0930\u094D\u0921 \u0939\u0948, \u091C\u093F\u0938\u0915\u0947 \u092E\u093E\u0927\u094D\u092F\u092E \u0938\u0947 \u0906\u092A \u0938\u092D\u0940 21 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0938\u0947\u0935\u093E\u0913\u0902 \u0915\u093E \u0932\u093E\u092D \u0938\u0930\u0932\u0924\u093E \u0938\u0947 \u0909\u0920\u093E \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "\u0915\u093E\u0930\u094D\u0921 \u0938\u094D\u0935\u0940\u0915\u0943\u0924\u093F \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "\u0906\u0935\u0947\u0926\u0928 \u091C\u092E\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926, \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u091F\u0940\u092E \u0906\u092A\u0915\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u094B\u0902 \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0924\u0940 \u0939\u0948 \u0914\u0930 \u0938\u093E\u0927\u093E\u0930\u0923\u0924\u0903 2 \u0938\u0947 3 \u0915\u093E\u0930\u094D\u092F \u0926\u093F\u0935\u0938\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0947 \u0938\u094D\u0935\u0940\u0915\u0943\u0924 \u0915\u0930 \u0926\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "\u0936\u093F\u0915\u093E\u092F\u0924 \u0928\u093F\u0935\u093E\u0930\u0923 \u092E\u0947\u0902 \u0915\u093F\u0924\u0928\u093E \u0938\u092E\u092F \u0932\u0917\u0924\u093E \u0939\u0948?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "\u0938\u092D\u0940 \u0928\u093E\u0917\u0930\u093F\u0915 \u0936\u093F\u0915\u093E\u092F\u0924\u094B\u0902 \u0915\u094B \u0926\u0930\u094D\u091C \u0915\u0930\u0928\u0947 \u0915\u0947 \u092C\u093E\u0926 \u0938\u0940\u0927\u0947 \u0915\u094D\u0937\u0947\u0924\u094D\u0930\u0940\u092F \u092A\u094D\u0930\u0936\u093E\u0938\u0915\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u093E \u091C\u093E\u0924\u093E \u0939\u0948, \u091C\u094B 48 \u0938\u0947 72 \u0918\u0902\u091F\u094B\u0902 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0907\u0938\u0915\u093E \u0938\u092E\u093E\u0927\u093E\u0928 \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964"
          }
        ],
        carouselSlides: [
          {
            titleEn: "Together, We Build a Better Tomorrow",
            titleHi: "\u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u0947 \u0932\u093F\u090F \u0938\u093E\u0925 \u092E\u093F\u0932\u0915\u0930 \u0906\u0917\u0947 \u092C\u095D\u0947\u0902",
            subEn: "Empowering lives. Strengthening communities.",
            subHi: "\u091C\u0940\u0935\u0928 \u0915\u094B \u0938\u0936\u0915\u094D\u0924 \u092C\u0928\u093E\u0928\u093E\u0964 \u0938\u092E\u0941\u0926\u093E\u092F\u094B\u0902 \u0915\u094B \u0938\u0941\u0926\u0943\u095D \u0915\u0930\u0928\u093E\u0964",
            image: "/assets/mega_camp_banner.png"
          },
          {
            titleEn: "Building a Better Tomorrow for Every Citizen",
            titleHi: "\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u0928\u093E\u0917\u0930\u093F\u0915 \u0915\u0947 \u0932\u093F\u090F \u090F\u0915 \u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923",
            subEn: "We create healthier, stronger, and empowered communities.",
            subHi: "\u0939\u092E \u0938\u094D\u0935\u0938\u094D\u0925, \u0938\u0936\u0915\u094D\u0924 \u0914\u0930 \u0905\u0927\u093F\u0915 \u0938\u092E\u0943\u0926\u094D\u0927 \u0938\u092E\u093E\u091C \u0915\u093E \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902\u0964",
            image: "/assets/water_pump_camp.png"
          }
        ],
        customServices: [],
        socialDirectory: [
          {
            name: "RP Foundation (Official)",
            platform: "instagram",
            handle: "@rpfoundationofficial",
            url: "https://www.instagram.com/rpfoundationofficial/",
            descEn: "Latest photos, videos & daily campaign highlights.",
            descHi: "\u0928\u0935\u0940\u0928\u0924\u092E \u092B\u094B\u091F\u094B, \u0935\u0940\u0921\u093F\u092F\u094B \u0914\u0930 \u0926\u0948\u0928\u093F\u0915 \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u091D\u0932\u0915\u093F\u092F\u093E\u0901\u0964"
          },
          {
            name: "Rohit Pandit (Founder)",
            platform: "instagram",
            handle: "@therohitpandit",
            url: "https://www.instagram.com/therohitpandit/",
            descEn: "Founder Rohit Pandit's personal social updates.",
            descHi: "\u0938\u0902\u0938\u094D\u0925\u093E\u092A\u0915 \u0930\u094B\u0939\u093F\u0924 \u092A\u0902\u0921\u093F\u0924 \u0915\u093E \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u091C\u0928\u0938\u0947\u0935\u093E \u092C\u094D\u0932\u0949\u0917\u0964"
          },
          {
            name: "RP Foundation Facebook",
            platform: "facebook",
            handle: "@rpfofficial",
            url: "https://www.facebook.com/rpfofficial",
            descEn: "Facebook community feeds and welfare program updates.",
            descHi: "\u092B\u0947\u0938\u092C\u0941\u0915 \u0938\u092E\u0941\u0926\u093E\u092F \u0914\u0930 \u091C\u0928 \u0915\u0932\u094D\u092F\u093E\u0923\u0915\u093E\u0930\u0940 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u094B\u0902 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940\u0964"
          },
          {
            name: "RP Foundation on X",
            platform: "x",
            handle: "@rpfoundation15",
            url: "https://x.com/rpfoundation15",
            descEn: "Real-time updates, announcements & relief requests.",
            descHi: "\u092E\u0939\u0924\u094D\u0935\u092A\u0942\u0930\u094D\u0923 \u0918\u094B\u0937\u0923\u093E\u090F\u0902 \u0914\u0930 \u0924\u094D\u0935\u0930\u093F\u0924 \u0930\u093E\u0939\u0924 \u0905\u0932\u0930\u094D\u091F \u091F\u094D\u0935\u093F\u091F\u0930 \u092A\u0930\u0964"
          },
          {
            name: "RP Foundation YouTube",
            platform: "youtube",
            handle: "RP Foundation Official",
            url: "https://www.youtube.com/@rpfoundationofficial",
            descEn: "Public awareness tutorials & campaign video reports.",
            descHi: "\u091C\u0928 \u091C\u093E\u0917\u0930\u0942\u0915\u0924\u093E \u091F\u094D\u092F\u0942\u091F\u094B\u0930\u093F\u092F\u0932 & \u0905\u092D\u093F\u092F\u093E\u0928 \u0915\u0940 \u0935\u0940\u0921\u093F\u092F\u094B \u0930\u093F\u092A\u094B\u0930\u094D\u091F\u094D\u0938\u0964"
          }
        ],
        notifications: [
          {
            id: "1",
            type: "urgent",
            titleEn: "Urgent Blood Need: O+",
            titleHi: "\u0906\u092A\u093E\u0924\u0915\u093E\u0932\u0940\u0928 \u0930\u0915\u094D\u0924 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E: O+",
            bodyEn: "Critical patient at Sehore Hospital requires 2 units of O+ blood.",
            bodyHi: "\u0938\u0940\u0939\u094B\u0930 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092E\u0947\u0902 \u0917\u0902\u092D\u0940\u0930 \u092E\u0930\u0940\u091C \u0915\u094B O+ \u0930\u0915\u094D\u0924 \u0915\u0940 2 \u092F\u0942\u0928\u093F\u091F \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0939\u0948\u0964",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          },
          {
            id: "2",
            type: "warning",
            titleEn: "Heatwave Alert - Madhya Pradesh",
            titleHi: "\u0932\u0942 \u0915\u0940 \u091A\u0947\u0924\u093E\u0935\u0928\u0940 - \u092E\u0927\u094D\u092F \u092A\u094D\u0930\u0926\u0947\u0936",
            bodyEn: "Temperatures expected to exceed 43\xB0C. Stay hydrated and avoid outdoor activity.",
            bodyHi: "\u0924\u093E\u092A\u092E\u093E\u0928 43 \u0921\u093F\u0917\u094D\u0930\u0940 \u0938\u0947\u0932\u094D\u0938\u093F\u092F\u0938 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u094B\u0928\u0947 \u0915\u0940 \u0938\u0902\u092D\u093E\u0935\u0928\u093E \u0939\u0948\u0964 \u0939\u093E\u0907\u0921\u094D\u0930\u0947\u091F\u0947\u0921 \u0930\u0939\u0947\u0902 \u0914\u0930 \u092C\u093E\u0939\u0930\u0940 \u0917\u0924\u093F\u0935\u093F\u0927\u093F\u092F\u094B\u0902 \u0938\u0947 \u092C\u091A\u0947\u0902\u0964",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            read: false
          }
        ],
        testimonials: [
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "\u0938\u0924\u094D\u092F\u0947\u0902\u0926\u094D\u0930 \u0920\u093E\u0915\u0941\u0930",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "\u0915\u0930\u094C\u0902\u0926 \u0935\u093E\u0930\u094D\u0921 5, \u092D\u094B\u092A\u093E\u0932",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education. Gratitude to Rohit Sir!",
            quoteHi: "\u092E\u0947\u0930\u0940 \u092C\u0947\u091F\u0940 \u0915\u094B \u0906\u0935\u0947\u0926\u0928 \u0915\u0930\u0928\u0947 \u0915\u0947 \u0968 \u0938\u092A\u094D\u0924\u093E\u0939 \u0915\u0947 \u092D\u0940\u0924\u0930 \u0938\u0940\u0927\u0947 \u0909\u0938\u0915\u0947 \u092C\u0948\u0902\u0915 \u0916\u093E\u0924\u0947 \u092E\u0947\u0902 \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u091B\u093E\u0924\u094D\u0930\u0935\u0943\u0924\u094D\u0924\u093F \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u0941\u0908\u0964 \u092F\u0939 \u0938\u0939\u093E\u092F\u0924\u093E \u0909\u0938\u0947 \u0915\u0949\u0932\u0947\u091C \u0915\u0940 \u0936\u093F\u0915\u094D\u0937\u093E \u091C\u093E\u0930\u0940 \u0930\u0916\u0928\u0947 \u092E\u0947\u0902 \u092E\u0926\u0926 \u0915\u0930 \u0930\u0939\u0940 \u0939\u0948\u0964 \u0930\u094B\u0939\u093F\u0924 \u0938\u0930 \u0915\u094B \u0927\u0928\u094D\u092F\u0935\u093E\u0926!"
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "\u0936\u093E\u0928\u094D\u0924\u093F \u0926\u0947\u0935\u0940",
            villageEn: "Sehore Block, MP",
            villageHi: "\u0938\u0940\u0939\u094B\u0930 \u092C\u094D\u0932\u0949\u0915, \u092E.\u092A\u094D\u0930.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors. They treated us like family members.",
            quoteHi: "\u092E\u0947\u0930\u0947 \u092A\u0924\u093F \u0915\u0947 \u0928\u0947\u0924\u094D\u0930 \u0911\u092A\u0930\u0947\u0936\u0928 \u0915\u0947 \u0926\u094C\u0930\u093E\u0928, \u0906\u0930\u092A\u0940 \u092B\u093E\u0909\u0902\u0921\u0947\u0936\u0928 \u0915\u0947 \u0938\u094D\u0935\u092F\u0902\u0938\u0947\u0935\u0915\u094B\u0902 \u0928\u0947 \u0905\u0938\u094D\u092A\u0924\u093E\u0932 \u092A\u0902\u091C\u0940\u0915\u0930\u0923 \u0938\u0947 \u0932\u0947\u0915\u0930 \u0930\u0915\u094D\u0924\u0926\u093E\u0924\u093E\u0913\u0902 \u0915\u0940 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E \u0915\u0930\u0928\u0947 \u0924\u0915 \u0938\u092C \u0915\u0941\u091B \u0915\u093F\u092F\u093E\u0964 \u0909\u0928\u094D\u0939\u094B\u0902\u0928\u0947 \u0939\u092E\u093E\u0930\u0947 \u0938\u093E\u0925 \u092A\u0930\u093F\u0935\u093E\u0930 \u0915\u0947 \u0938\u0926\u0938\u094D\u092F\u094B\u0902 \u091C\u0948\u0938\u093E \u0935\u094D\u092F\u0935\u0939\u093E\u0930 \u0915\u093F\u092F\u093E\u0964"
          }
        ]
      };
      await pool2.query(
        `INSERT INTO settings (id, "founderMessageEn") VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $2`,
        ["cms_data", JSON.stringify(defaults)]
      );
      return res.json({ success: true, cms: defaults });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/cms", async (req, res) => {
  try {
    await pool2.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/campaigns", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    res.json({ campaigns: result.rows });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/campaigns", async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool2.query(
      `INSERT INTO campaigns 
       (id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/campaigns/:id/edit", async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    await pool2.query(
      `UPDATE campaigns SET 
       "titleEn" = $1, "titleHi" = $2, "goalAmount" = $3, "raisedAmount" = $4, 
       "imageUrl" = $5, "coverImgUrl" = $6, urgent = $7 
       WHERE id = $8`,
      [
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing campaign:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/social", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt" FROM social_posts ORDER BY "createdAt" DESC'
    );
    res.json({ posts: result.rows });
  } catch (error) {
    console.error("Error fetching social posts:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/social", async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool2.query(
      `INSERT INTO social_posts 
       (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, false, $8, $9, $10)`,
      [
        id,
        author,
        role,
        avatar || "",
        textEn,
        textHi,
        image || "",
        platform || "instagram",
        link || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error creating social post:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/social/like", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool2.query("SELECT liked, likes FROM social_posts WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      const liked = !post.liked;
      const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      await pool2.query("UPDATE social_posts SET liked = $1, likes = $2 WHERE id = $3", [liked, likes, id]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/social/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM social_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/social/:id/edit", async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    await pool2.query(
      `UPDATE social_posts SET 
       author = $1, role = $2, avatar = $3, "textEn" = $4, "textHi" = $5, 
       image = $6, platform = $7, link = $8 
       WHERE id = $9`,
      [author, role, avatar, textEn, textHi, image, platform, link, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/volunteers", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, name, email, phone, points, "registeredAt" FROM volunteers ORDER BY "registeredAt" DESC'
    );
    res.json({ volunteers: result.rows });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/volunteers/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/volunteers/:id/points", async (req, res) => {
  try {
    const { points } = req.body;
    await pool2.query("UPDATE users SET points = $1 WHERE id = $2", [points, req.params.id]);
    await pool2.query("UPDATE volunteers SET points = $1 WHERE id = $2", [points, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/submissions", async (req, res) => {
  try {
    const result = await pool2.query(
      `SELECT id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp 
       FROM service_submissions 
       ORDER BY timestamp DESC`
    );
    res.json({ submissions: result.rows });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/submissions", async (req, res) => {
  try {
    let body = req.body;
    if (Array.isArray(body)) {
      body = body[0];
    }
    const { userId, citizenName, citizenPhone, serviceName, submissionData, status, latitude, longitude, timestamp } = body;
    const id = import_crypto.default.randomUUID();
    const result = await pool2.query(
      `INSERT INTO service_submissions 
       (id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        id,
        userId || "guest",
        serviceName,
        serviceName,
        citizenName || "Citizen",
        citizenPhone || "",
        submissionData || "{}",
        status || "pending",
        latitude || null,
        longitude || null,
        (/* @__PURE__ */ new Date()).toISOString(),
        timestamp || (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error("Error creating submission:", err);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/submissions/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await pool2.query("UPDATE service_submissions SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/submissions/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM service_submissions WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, name, email, phone, role, points, badges, "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor", "onboardingCompleted", "registeredAt" FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/users/:id/update", async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    if (fields.length === 0) {
      return res.json({ success: true });
    }
    const setClause = fields.map((field, idx) => `"${field}" = $${idx + 1}`).join(", ");
    const values = fields.map((field) => req.body[field]);
    values.push(req.params.id);
    await pool2.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/health_camps", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    res.json({ camps: result.rows });
  } catch (error) {
    console.error("Error fetching health camps:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/health_camps", async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool2.query(
      `INSERT INTO health_camps 
       (id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        dateEn,
        dateHi,
        locationEn,
        locationHi,
        contact || "",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating health camp:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/health_camps/:id/edit", async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    await pool2.query(
      `UPDATE health_camps SET 
       "titleEn" = $1, "titleHi" = $2, "dateEn" = $3, "dateHi" = $4, 
       "locationEn" = $5, "locationHi" = $6, contact = $7 
       WHERE id = $8`,
      [titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error editing health camp:", error);
    res.status(500).json({ error: error.message });
  }
});
app.delete("/api/health_camps/:id", async (req, res) => {
  try {
    await pool2.query("DELETE FROM health_camps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting health camp:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/blood_donors", async (req, res) => {
  try {
    const result = await pool2.query(
      'SELECT id, name, "bloodGroup", phone, location, verified, distance, "lastDonated" FROM blood_donors ORDER BY "createdAt" DESC'
    );
    res.json({ donors: result.rows });
  } catch (error) {
    console.error("Error fetching blood donors:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/blood_donors", async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, verified, distance, lastDonated } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool2.query(
      `INSERT INTO blood_donors 
       (id, name, "bloodGroup", phone, location, verified, distance, "lastDonated", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        name,
        bloodGroup,
        phone,
        location || "Local Area",
        verified !== false,
        distance || "0.1 km away",
        lastDonated || "Available",
        (/* @__PURE__ */ new Date()).toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error creating blood donor:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/job_applications", async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, phone, resume } = req.body;
    const id = import_crypto.default.randomUUID();
    await pool2.query(
      `INSERT INTO job_applications (id, "jobId", "jobTitle", "fullName", phone, resume, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, jobId, jobTitle, fullName, phone, resume || "", (/* @__PURE__ */ new Date()).toISOString()]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving job application:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/notifications", async (req, res) => {
  try {
    const result = await pool2.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ notifications: parsed.notifications || [] });
    }
    res.json({ notifications: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/testimonials", async (req, res) => {
  try {
    const result = await pool2.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/stats", async (req, res) => {
  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;
  try {
    const bRes = await pool2.query("SELECT COUNT(*) FROM card_applications");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const vRes = await pool2.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const hRes = await pool2.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {
  }
  try {
    const sRes = await pool2.query(`
      SELECT COUNT(*) FROM service_submissions 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {
  }
  res.json({
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  });
});
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  }
});
async function saveFileLocally(file) {
  const fileExt = import_path.default.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExt}`;
  const destDir = import_path.default.join(process.cwd(), "appapi.therpfoundation.org", "public", "uploads");
  if (!import_fs.default.existsSync(destDir)) {
    import_fs.default.mkdirSync(destDir, { recursive: true });
  }
  const destFilePath = import_path.default.join(destDir, filename);
  await import_fs.default.promises.writeFile(destFilePath, file.buffer);
  return `https://appapi.therpfoundation.org/uploads/${filename}`;
}
app.post("/api/upload/founder", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Founder image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/upload/broadcast", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Broadcast image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
app.post("/api/upload/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Generic image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});
app.use("/uploads", import_express2.default.static(import_path.default.join(process.cwd(), "appapi.therpfoundation.org", "public", "uploads")));
app.use("/app", import_express2.default.static(import_path.default.join(process.cwd(), "public", "app")));
app.get("/app", (req, res) => {
  res.redirect("/app/");
});
async function startServer() {
  await initDatabase();
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
