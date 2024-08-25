import sharp from 'sharp';
import { redirect } from './redirect.js';

export async function compressImg(request, reply, imgStream) {
    const { webp, grayscale, quality, originSize } = request.params;
    const imgFormat = webp ? 'webp' : 'jpeg';

    try {
        // Create the sharp instance without immediately loading data into memory
        const sharpInstance = sharp()
            .grayscale(grayscale) // Apply grayscale conditionally
            .toFormat(imgFormat, {
                quality, // Use the provided quality
                progressive: true,
                optimizeScans: webp, // Optimize scans only for WebP
                chromaSubsampling: webp ? '4:4:4' : '4:2:0', // Conditional chroma subsampling
            });

        // Pipe the input stream to sharp for processing
        const transformStream = imgStream.pipe(sharpInstance);

        // Set headers before sending the response
        reply
            .header('content-type', `image/${imgFormat}`)
            .header('x-original-size', originSize);

        // Calculate content length after processing (only possible if you can buffer or the size is known in advance)
        let processedSize = 0;
        transformStream.on('data', (chunk) => {
            processedSize += chunk.length;
        });

        transformStream.on('end', () => {
            reply.header('content-length', processedSize);
            reply.header('x-bytes-saved', originSize - processedSize);
        });

        // Pipe the processed image data to the reply output stream
        reply.code(200);
        transformStream.pipe(reply.raw);

        // Handle stream errors
        transformStream.on('error', (err) => {
            console.error('Processing error:', err);
            return redirect(request, reply);
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return redirect(request, reply);
    }
}
