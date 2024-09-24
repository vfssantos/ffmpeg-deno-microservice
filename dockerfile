# Use the official Deno image as the base
FROM denoland/deno:alpine

# Install FFmpeg
RUN apk update && \
    apk add --no-cache ffmpeg

# Create non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory inside the container
WORKDIR /app

# Copy the application code to the container
COPY server.ts .

# Set ownership of the application directory
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Create necessary directories with proper permissions
RUN mkdir ./uploads ./outputs && \
    chmod -R 755 ./uploads ./outputs

# Expose the port your application will run on
EXPOSE 8000

# Set the command to run your application with limited permissions
CMD ["run", "--allow-net", "--allow-read=./uploads,./outputs", "--allow-write=./uploads,./outputs", "--allow-run", "server.ts"]
