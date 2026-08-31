// cPanel CloudLinux Passenger entry point.
// package.json declares "type": "module", so this wrapper must use ESM syntax.
// server.cjs is the bundled CommonJS application produced by the build.
import './server.cjs';
