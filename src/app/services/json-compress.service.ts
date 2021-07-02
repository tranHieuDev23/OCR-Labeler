import { Injectable } from '@angular/core';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

@Injectable({
  providedIn: 'root',
})
export class JsonCompressService {
  constructor() {}

  public compress(obj: any): string {
    const jsonStr: string = JSON.stringify(obj);
    return compressToEncodedURIComponent(jsonStr);
  }

  public decompress(compressed: string): any {
    return JSON.parse(decompressFromEncodedURIComponent(compressed));
  }
}
