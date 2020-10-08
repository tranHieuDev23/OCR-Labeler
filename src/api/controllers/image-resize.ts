import * as sharp from "sharp";

function resizeImage(imageSrc: any, maxWidth: number, maxHeight: number): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const image = sharp(imageSrc);
        image.metadata().then((meta) => {
            const width: number = meta.width;
            const height: number = meta.height;
            const needResizing: boolean = width > maxWidth || height > maxHeight;
            const resizedImage = needResizing
                ? image.resize(maxWidth, maxHeight, { fit: 'inside' })
                : image;
            resizedImage.toBuffer().then(resolve, reject);
        }, reject);
    });
}

export { resizeImage };