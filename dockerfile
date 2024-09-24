# Use the official Deno Debian-based image as the base
FROM denoland/deno

# Install FFmpeg and necessary dependencies
RUN apt-get update && \
    apt-get install -y ffmpeg libgcc1 && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the application code to the container
COPY . .

# Create necessary directories with proper permissions
RUN mkdir ./uploads ./outputs

# Expose the port your application will run on
EXPOSE 8000

# Set the command to run your application with limited permissions
CMD ["run", "-A",  "audio-compressor.ts"]
