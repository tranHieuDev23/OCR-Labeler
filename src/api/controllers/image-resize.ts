import * as sharp from "sharp";

function resizeImage(imageSrc: any, minWidth: number, minHeight: number): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const image = sharp(imageSrc);
        image.metadata().then((meta) => {
            const width: number = meta.width;
            const height: number = meta.height;
            const needResizing: boolean = width > minWidth || height > minHeight;
            const resizedImage = needResizing
                ? image.resize(minWidth, minHeight, { fit: 'outside' })
                : image;
            resizedImage.toBuffer().then(resolve, reject);
        }, reject);
    });
}

export { resizeImage };