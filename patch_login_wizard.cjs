const fs = require('fs');

let file = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

const regex = /\{mode === "registerForm" && \([\s\S]*?<\/div>\s*\)\}/;

const replacement = `
          {mode === "registerForm" && (
            <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm p-4 flex items-center justify-center">
              <div className="w-full h-full max-h-[750px] relative">
                <VolunteerRegistrationWizard 
                  onBack={() => setMode("welcome")} 
                  onComplete={async (username, pass) => {
                    // Automatically log them in with the new credentials
                    const uid = "usr_" + username;
                    await onLoginSuccess("volunteer", { id: uid, name: "Volunteer (" + username + ")" });
                  }} 
                />
              </div>
            </div>
          )}
`;

file = file.replace(regex, replacement);

fs.writeFileSync('src/components/LoginScreen.tsx', file);
