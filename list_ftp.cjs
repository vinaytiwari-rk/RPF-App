const ftp = require("basic-ftp");
const path = require("path");

async function main() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        await client.access({
            host: "ftp.therpfoundation.org",
            user: "RPF_App@appapi.therpfoundation.org",
            password: "therpfoundation@321",
            secure: false
        });
        console.log("Connected to FTP server!");
        const list = await client.list();
        console.log("Remote directory listing:");
        for (const item of list) {
            console.log(`${item.type === 2 ? 'DIR' : 'FILE'}: ${item.name} (${item.size} bytes)`);
        }
    } catch (err) {
        console.error("FTP Error:", err);
    } finally {
        client.close();
    }
}

main();
