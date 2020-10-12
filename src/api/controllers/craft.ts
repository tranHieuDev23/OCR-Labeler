import { Region, TextRegion } from "src/app/models/text-region";
import Axios from 'axios';
import { environment } from 'src/environments/environment';
import LabelStatus from 'src/app/models/label-status';
import User from 'src/app/models/user';
import uid from 'uid';

function processImageWithCraft(imageId: string, user: User, image: Buffer): Promise<TextRegion[]> {
    return new Promise<TextRegion[]>((resolve, reject) => {
        Axios.post(environment.craftServer, image, {
            headers: {
                'Content-Type': 'image/jpeg'
            }
        }).then((result) => {
            const regions: Region[] = [];
            for (let item of result.data) {
                regions.push(Region.parseFromJson(item));
            }
            const results: TextRegion[] = [];
            for (let item of regions) {
                results.push(new TextRegion(
                    uid(35),
                    imageId,
                    item,
                    null,
                    LabelStatus.NotLabeled,
                    user,
                    null,
                    null
                ));
            }
            resolve(results);
        }, reject);
    });
}

export { processImageWithCraft };