import fs from "fs";
import path from "path";

// Custom Vite plugin to patch MediaPipe exports
function mediaPipePlugin() {
	return {
		name: "mediapipe_workaround",
		load(id) {
			if (path.basename(id) === "face_mesh.js") {
				let code = fs.readFileSync(id, "utf-8");
				code += "\nexports.FaceMesh = FaceMesh;";
				return { code };
			}
			return null;
		},
	};
}

export default mediaPipePlugin;


