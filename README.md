# HastVani

Restored React interface from the supplied HastVani prototype, including Home, Learn ISL, Translator, and a demo login dialog. Uses Vite and React.

Run `npm install` and `npm run dev` for development. Netlify runs `npm run build` and publishes `dist`, as configured in `netlify.toml`.

Camera preview requires HTTPS or localhost and browser permission. Stop, page navigation, and component cleanup release the camera. Speech uses browser speech synthesis where available.

Recognition is an explicitly labeled simulation: synthetic landmarks and random gesture labels are not real sign recognition. The original gesture cards are preserved as prototype content and are not a verified ISL alphabet. Express, MongoDB, authenticated accounts, and saved history are not implemented. The demo session collects no credentials and persists no data.
