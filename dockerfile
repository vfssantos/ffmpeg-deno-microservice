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

# Get the port from the environment variable
ARG PORT

ENV PORT=${PORT:-8000}

# Expose the port your application will run on
EXPOSE ${PORT}

# Set the command to run your application with limited permissions
CMD ["run", "-A",  "main.ts"]
