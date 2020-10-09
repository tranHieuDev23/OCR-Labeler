import UploadedImage from "src/app/models/uploaded-image";
import databaseConnection from './database';

class ImageDao {
    private constructor() { }

    public static getInstance(): ImageDao {
        return new ImageDao();
    }

    public addImage(image: UploadedImage): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            databaseConnection.none(
                `
                    INSERT INTO public."Images"("imageId", "imageUrl", "thumbnailUrl", "uploadedBy", "uploadedDate", status)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
                [
                    image.imageId,
                    image.imageUrl,
                    image.thumbnailUrl,
                    image.uploadedBy.username,
                    image.uploadedDate.getTime(),
                    image.status
                ]
            ).then(() => {
                resolve();
            }, (reason) => {
                reject(`[addImage()] Error happened while writing into database: ${reason}`);
            });
        });
    }
};

export default ImageDao;