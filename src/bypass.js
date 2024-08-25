export function bypass(request, reply, stream) {
    reply.header('x-proxy-bypass', 1);

    // Pipe the input stream directly to the reply (response) stream
    reply.code(200);
    stream.pipe(reply.raw);

    // Handle stream errors
    stream.on('error', (err) => {
        console.error('Stream error:', err);
        reply.code(500).send('Internal Server Error');
    });
}
