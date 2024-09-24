// server.ts
const PORT = Deno.env.get("PORT") || 8000;

const handler = async (request: Request): Promise<Response> => {
  console.log("Received request");
  const formData: Record<string, any> = {};

  let inputPath: string | null = null;
  let outputPath: string | null = null;


  try {
    const headers = Object.fromEntries(request.headers.entries());
    const contentType = headers?.["content-type"] || headers?.["Content-Type"] || "";

    console.log("Content-Type:", contentType);

    if (contentType.includes("multipart/form-data")) {
      console.log("Parsing multipart form data");
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        if (value instanceof File) {
          formData[key] = value;
        } else {
          try {
            formData[key] = JSON.parse(value);
          } catch {
            formData[key] = value;
          }
        }
      }
    } else {
      throw new Error("Unsupported content type");
    }

    // Extract the file from formData
    const file = formData.file;
    if (!(file instanceof File)) {
      throw new Error("No file or invalid file provided");
    }

    console.log("File received:", file.name);

    // Generate unique filenames to prevent conflicts
    const uniqueId = crypto.randomUUID();
    const inputFileName = `${uniqueId}_${file.name}`;
    inputPath = `./uploads/${inputFileName}`;
    const outputFileName = `audio_${uniqueId}.ogg`;
    outputPath = `./outputs/${outputFileName}`;

    console.log("Input path:", inputPath);
    console.log("Output path:", outputPath);

    // Ensure upload and output directories exist
    await Deno.mkdir("./uploads", { recursive: true });
    await Deno.mkdir("./outputs", { recursive: true });

    // Save the uploaded file
    const fileContent = await file.arrayBuffer();
    await Deno.writeFile(inputPath, new Uint8Array(fileContent));
    console.log("File saved to uploads directory");

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
      "lowdelay",               // Set application type to VoIP
      "-preset",
      "veryfast",
      outputPath            // Output file
    ];

    console.log("FFmpeg command:", ffmpegArgs.join(" "));

    // Initialize the Deno.Command
    const command = new Deno.Command("ffmpeg", {
      args: ffmpegArgs,
      stdout: "piped",
      stderr: "piped",
    });

    // Execute the FFmpeg command and collect output
    console.log("Executing FFmpeg command");
    const subprocess = command.spawn();
    const { code, stdout, stderr } = await subprocess.output();

    if (code === 0) {
      console.log("FFmpeg processing successful");
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
      console.error("FFmpeg processing failed:", errorString);
      throw new Error(`FFmpeg processing failed: ${errorString}`);
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  } finally {
    // Clean up temporary files
    try {
      if (inputPath) {
        await Deno.remove(inputPath);
        console.log("Cleaned up input file:", inputPath);
      }
      if (outputPath) {
        await Deno.remove(outputPath);
        console.log("Cleaned up output file:", outputPath);
      }
    } catch (cleanupError) {
      console.warn("Cleanup failed:", cleanupError);
    }
  }
};

console.log(`Server is running on http://localhost:${PORT}`);
Deno.serve({ port: PORT }, handler);
