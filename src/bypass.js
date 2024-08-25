export function bypass(request, reply, stream) {
    // Set initial headers
    reply.header('x-proxy-bypass', 1);

    // If the content length is known, we set it; otherwise, we stream without it
    const contentLength = request.params.originSize;

    if (contentLength) {
        reply.header('content-length', contentLength);
    }

    // Set content-type header if it's available
    const contentType = request.params.originType;
    if (contentType) {
        reply.header('content-type', contentType);
    }

    // Pipe the input stream directly to the reply (response) stream
    reply.code(200);
    stream.pipe(reply.raw);

    // Handle stream errors
    stream.on('error', (err) => {
        console.error('Stream error:', err);
        reply.code(500).send('Internal Server Error');
    });
}
