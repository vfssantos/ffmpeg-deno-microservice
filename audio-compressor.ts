// server.ts
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
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
      const contentType = request.headers.get("content-type")!;
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) {
        return new Response("Malformed multipart/form-data request", { status: 400 });
      }
      const boundary = boundaryMatch[1];
      const multipart = new MultipartReader(request.body!, boundary);
      const form = await multipart.readForm();

      const file = form.file("file");
      if (!file) {
        return new Response("No file uploaded", { status: 400 });
      }

      // Generate unique filenames to prevent conflicts
      const uniqueId = crypto.randomUUID();
      const inputFileName = `${uniqueId}_${file.filename}`;
      inputPath = `./uploads/${inputFileName}`;
      const outputFileName = `audio_${uniqueId}.ogg`;
      outputPath = `./outputs/${outputFileName}`;

      // Ensure upload and output directories exist
      await Deno.mkdir("./uploads", { recursive: true });
      await Deno.mkdir("./outputs", { recursive: true });

      // Save the uploaded file
      await Deno.writeFile(inputPath, file.content);

      // Define the FFmpeg parameters to compress to audio format
      const ffmpegArgs = [
        "-i",
        inputPath,            // Input file
        "-vn",                // Disable video
        "-map_metadata",
        "-1",                 // Remove metadata
        "-ac",
        "1",                  // Set number of audio channels to 1
        "-c:a",
        "libopus",            // Use Opus codec
        "-b:a",
        "12k",                // Audio bitrate
        "-application",
        "voip",               // Set application type to VoIP
        outputPath            // Output file
      ];

      // Initialize the Deno.Command
      const command = new Deno.Command("ffmpeg", {
        args: ffmpegArgs,
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
            "Content-Type": "audio/ogg",
            "Content-Disposition": `attachment; filename="${outputFileName}"`,
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
await serve(handler, { port: PORT });
