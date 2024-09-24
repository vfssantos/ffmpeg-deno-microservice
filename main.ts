// server.ts
import { MultipartReader } from "https://deno.land/std@0.203.0/mime/multipart.ts";

const PORT = 8000;

const handler = async (request: Request): Promise<Response> => {
  if (
    request.method === "POST" &&
    request.headers.get("content-type")?.includes("multipart/form-data")
  ) {
    let inputPath: string | undefined;
    let outputPath: string | undefined;

    try {
      const boundary = request.headers
        .get("content-type")!
        .split("boundary=")[1];
      const reader = request.body?.getReader();
      if (!reader) {
        return new Response("No body found", { status: 400 });
      }

      const multipart = new MultipartReader(request.body!, boundary);
      const form = await multipart.readForm();

      const file = form.file("file");
      if (!file) {
        return new Response("No file uploaded", { status: 400 });
      }

      // Generate unique filenames to prevent conflicts
      const uniqueId = crypto.randomUUID();
      inputPath = `./uploads/${uniqueId}_${file.filename}`;
      outputPath = `./outputs/output_${uniqueId}_${file.filename}`;

      // Save the uploaded file
      await Deno.mkdir("./uploads", { recursive: true });
      await Deno.writeFile(inputPath, file.content);

      // Extract additional FFmpeg parameters from form data
      const ffmpegParams: string[] = [];

      for (const [key, value] of form.entries()) {
        if (key.startsWith("ffmpeg_")) {
          const param = value.toString().trim();
          // Optional: Validate the parameter here
          ffmpegParams.push(param);
        }
      }

      // Default FFmpeg parameters if none provided
      if (ffmpegParams.length === 0) {
        ffmpegParams.push("-vf", "scale=320:240");
      }

      // Construct the FFmpeg command arguments
      const args = ["-i", inputPath, ...ffmpegParams, outputPath];

      // Initialize the Deno.Command
      const command = new Deno.Command("ffmpeg", {
        args,
        stdout: "piped",
        stderr: "piped",
      });

      // Execute the FFmpeg command and collect output
      const subprocess = command.spawn();

      const { code, stdout, stderr } = await subprocess.output();

      if (code === 0) {
        // Read the processed file
        const processedFile = await Deno.readFile(outputPath);

        // Respond with the processed file
        return new Response(processedFile, {
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="processed_${file.filename}"`,
          },
        });
      } else {
        const errorString = new TextDecoder().decode(stderr);
        return new Response(`FFmpeg processing failed:\n${errorString}`, {
          status: 500,
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    } finally {
      // Clean up temporary files
      try {
        if (inputPath) {
          await Deno.remove(inputPath);
        }
        if (outputPath) {
          await Deno.remove(outputPath);
        }
      } catch (cleanupError) {
        console.warn("Cleanup failed:", cleanupError);
      }
    }
  }

  return new Response("Invalid Request", { status: 400 });
};

console.log(`Server is running on http://localhost:${PORT}`);
await Deno.serve(handler, { port: PORT });
