# Audio/Video Compressor API

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Use Case](#use-case)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running with Docker](#running-with-docker)
  - [Deploying to Fly.io](#deploying-to-flyio)
- [API Usage](#api-usage)
  - [Endpoint](#endpoint)
  - [Request](#request)
  - [Response](#response)
  - [Example with `curl`](#example-with-curl)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Introduction

**Audio/Video Compressor API** is a lightweight and efficient microservice designed to convert large audio and video files into highly compressed audio formats. Built with [Deno](https://deno.land/) and containerized using [Docker](https://www.docker.com/), this API leverages [FFmpeg](https://ffmpeg.org/) to ensure minimal file sizes without significant loss of quality.

## Features

- **Simple RESTful API**: Easy-to-use endpoints for file conversion.
- **Highly Compressed Output**: Converts files to OGG audio format using the Opus codec, achieving small file sizes suitable for various applications.
- **Secure and Efficient**: Runs as a non-root user within Docker for enhanced security.
- **Scalable**: Designed to handle multiple requests concurrently with optimized resource management.
- **Open Source**: Available for community contributions and improvements.

## Use Case

Many AI transcription APIs impose maximum file size limits, making it challenging to process large audio or video files. Traditional solutions involve slicing big files into chunks and transcribing them individually, which can lead to loss of context between segments. **Audio/Video Compressor API** offers a simpler and more effective approach by compressing the entire file as much as possible, ensuring that the transcription process remains efficient and contextually accurate.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your machine.
- [Git](https://git-scm.com/) for cloning the repository.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/vfssantos/ffmpeg-deno-microservice.git
   cd ffmpeg-deno-microservice
   ```

2. **Build the Docker Image**

   ```bash
   docker build -t ffmpeg-deno-microservice .
   ```

### Running with Docker

Run the Docker container with appropriate resource allocations and volume mounts for optimal performance.

```bash
docker run -d \
  -p 8000:8000 \
  --name ffmpeg-deno-microservice \
  --cpus="2.0" \
  --memory="4g" \
  -v /host/uploads:/app/uploads \
  -v /host/outputs:/app/outputs \
  ffmpeg-deno-microservice
```

- `-d`: Runs the container in detached mode.
- `-p 8000:8000`: Maps port `8000` of the container to port `8000` on the host.
- `--cpus="2.0"`: Allocates 2 CPU cores to the container.
- `--memory="4g"`: Allocates 4 GB of RAM to the container.
- `-v /host/uploads:/app/uploads`: Mounts the host's `uploads` directory to the container.
- `-v /host/outputs:/app/outputs`: Mounts the host's `outputs` directory to the container.


## Deploying to Fly.io

You can easily deploy this API to [Fly.io](https://fly.io/) for global availability.

### Steps to Deploy

1. **Install Flyctl**

   If you haven't already, install the Fly CLI:

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

   Or use Homebrew (macOS):

   ```bash
   brew install superfly/tap/flyctl
   ```

2. **Authenticate with Fly.io**

   Log in or sign up:

   ```bash
   flyctl auth signup
   ```

3. **Initialize the Fly App**

   Navigate to your project directory and run:

   ```bash
   flyctl launch
   ```

   - **App Name**: Provide a unique name or accept the default.
   - **Select Region**: Choose the closest region to your users.
   - **Dockerfile Detected**: The CLI should detect the `Dockerfile`.
   - **Deploy Now**: Choose **No** to make adjustments before deploying.

4. **Configure `fly.toml`**

   The `flyctl launch` command generates a `fly.toml` file. You can customize settings like environment variables, resources, and network configurations.

5. **Set Resource Allocation**

   Adjust CPU and memory if needed:

   ```bash
   flyctl scale vm shared-cpu-2x --memory 4096
   ```

   - `shared-cpu-2x`: Allocates 2 shared CPUs.
   - `--memory 4096`: Allocates 4 GB of RAM. 

6. **Deploy the App**

   Run:

   ```bash
   flyctl deploy
   ```

   This command builds the Docker image and deploys it to Fly.io.

7. **Monitor Deployment**

   Check the status:

   ```bash
   flyctl status
   ```

   View logs:

   ```bash
   flyctl logs
   ```

8. **Access the API**

   After deployment, your app will be accessible at:

   ```
   https://your-app-name.fly.dev
   ```

   Replace `your-app-name` with the name you chose during `flyctl launch`.

### Example Request

```bash
curl -X POST \
  -F "file=@/path/to/your/input_file.mp4" \
  "https://your-app-name.fly.dev/convert" \
  --output compressed_audio.ogg
```

## API Usage

### Endpoint

```
POST /
```

### Request

- **Headers**:
  - `Content-Type: multipart/form-data`
- **Body**:
  - `file`: The audio or video file to be compressed.

### Response

- **Success (200 OK)**:
  - **Content-Type**: `audio/ogg`
  - **Body**: The compressed OGG audio file.
- **Error (4xx/5xx)**:
  - **Content-Type**: `text/plain`
  - **Body**: Error message detailing what went wrong.

### Example with `curl`

Compress a video file and download the resulting audio:

```bash
curl -X POST \
  -F "file=@/path/to/your/input_file.mp4" \
  "http://localhost:8000/" \
  --output processed_audio.ogg
```

- `-F "file=@/path/to/your/input_file.mp4"`: Uploads the input file (audio or video).
- `--output processed_audio.ogg`: Saves the compressed audio output.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

Please ensure that your code adheres to the project's coding standards and includes appropriate tests.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Deno](https://deno.land/) - A secure runtime for JavaScript and TypeScript.
- [FFmpeg](https://ffmpeg.org/) - A complete, cross-platform solution to record, convert and stream audio and video.
- [Docker](https://www.docker.com/) - An open platform for developing, shipping, and running applications.
- [jrottenberg/ffmpeg](https://hub.docker.com/r/jrottenberg/ffmpeg) - FFmpeg Docker image.
