# Audio/Video Compressor API

![License](https://img.shields.io/github/license/yourusername/audiovideo-compressor-api)
![Docker](https://img.shields.io/docker/v/yourusername/audiovideo-compressor-api)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/yourusername/audiovideo-compressor-api/CI)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Use Case](#use-case)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running with Docker](#running-with-docker)
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
   git clone https://github.com/yourusername/audiovideo-compressor-api.git
   cd audiovideo-compressor-api
   ```

2. **Build the Docker Image**

   ```bash
   docker build -t audiovideo-compressor-api .
   ```

### Running with Docker

Run the Docker container with appropriate resource allocations and volume mounts for optimal performance.

```bash
docker run -d \
  -p 8000:8000 \
  --name audiovideo-compressor-api \
  --cpus="2.0" \
  --memory="4g" \
  -v /host/uploads:/app/uploads \
  -v /host/outputs:/app/outputs \
  audiovideo-compressor-api
```

- `-d`: Runs the container in detached mode.
- `-p 8000:8000`: Maps port `8000` of the container to port `8000` on the host.
- `--cpus="2.0"`: Allocates 2 CPU cores to the container.
- `--memory="4g"`: Allocates 4 GB of RAM to the container.
- `-v /host/uploads:/app/uploads`: Mounts the host's `uploads` directory to the container.
- `-v /host/outputs:/app/outputs`: Mounts the host's `outputs` directory to the container.

## API Usage

### Endpoint

```
POST /convert
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
  "http://localhost:8000/convert" \
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
