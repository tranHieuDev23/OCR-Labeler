import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import LabelStatus from '../models/label-status';
import { TextRegion, Region } from '../models/text-region';
import UploadedImage from '../models/uploaded-image';

const REGIONS: TextRegion[] = [
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642702909-dec73df255d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    "https://images.unsplash.com/photo-1593642532454-e138e28a63f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=889&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
  new TextRegion(
    "123",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    new Region(0, 0, 0, 0),
    "This is an example label",
    LabelStatus.NotLabeled,
    null,
    null),
];

const IMAGES: UploadedImage[] = [
  new UploadedImage("1",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("2",
    "https://images.unsplash.com/photo-1601788859878-41262a4f7680?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80",
    "https://images.unsplash.com/photo-1601788859878-41262a4f7680?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("3",
    "https://images.unsplash.com/photo-1601578662722-3dfcd9ba0ba2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1601578662722-3dfcd9ba0ba2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("4",
    "https://images.unsplash.com/photo-1601717136713-1885745b8cdf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=324&q=80",
    "https://images.unsplash.com/photo-1601717136713-1885745b8cdf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=324&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("5",
    "https://images.unsplash.com/photo-1601732299764-74a056876150?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
    "https://images.unsplash.com/photo-1601732299764-74a056876150?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("6",
    "https://images.unsplash.com/photo-1601747219414-c7d697dbc472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1601747219414-c7d697dbc472?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("7",
    "https://images.unsplash.com/photo-1593642532400-2682810df593?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1593642532400-2682810df593?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("8",
    "https://images.unsplash.com/photo-1601650538731-55e2ab3ed5af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1601650538731-55e2ab3ed5af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("9",
    "https://images.unsplash.com/photo-1601743383597-c24974f7112b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1601743383597-c24974f7112b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("10",
    "https://images.unsplash.com/photo-1601740289404-6d0dca1bc904?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1601740289404-6d0dca1bc904?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=700&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("11",
    "https://images.unsplash.com/photo-1601806173202-d46e0e3bd6c1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    "https://images.unsplash.com/photo-1601806173202-d46e0e3bd6c1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("12",
    "https://images.unsplash.com/photo-1601718898812-3106906eb0d4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1601718898812-3106906eb0d4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("13",
    "https://images.unsplash.com/photo-1593642703013-5a3b53c965f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=925&q=80",
    "https://images.unsplash.com/photo-1593642703013-5a3b53c965f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=925&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("14",
    "https://images.unsplash.com/photo-1601754356300-1aa733ea06b4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
    "https://images.unsplash.com/photo-1601754356300-1aa733ea06b4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("15",
    "https://images.unsplash.com/photo-1601643148650-ad24f2af0381?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1601643148650-ad24f2af0381?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("16",
    "https://images.unsplash.com/photo-1601690772364-13d8ca9cf930?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
    "https://images.unsplash.com/photo-1601690772364-13d8ca9cf930?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("17",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    null,
    null,
    REGIONS),
  new UploadedImage("18",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    "https://images.unsplash.com/photo-1601677237215-c9a8f0747b0b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
    null,
    null,
    REGIONS),
];

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    private http: HttpClient
  ) { }

  public loadRegionsForLabeling(userId: string, itemCount: number): Promise<TextRegion[]> {
    return new Promise<TextRegion[]>((resolve, reject) => {
      resolve(REGIONS.slice(0, itemCount));
    });
  }

  public labelRegion(region: TextRegion, canLabel: boolean, label: string): Promise<void> {
    return new Promise<void>((resolve, rejects) => {
      resolve();
    });
  }

  public loadRegionsForVerifying(userId: string, itemCount: number): Promise<TextRegion[]> {
    return new Promise<TextRegion[]>((resolve, reject) => {
      resolve(REGIONS.slice(0, itemCount));
    });
  }

  public verifyLabel(region: TextRegion, isCorrect: boolean): Promise<void> {
    return new Promise<void>((resolve, rejects) => {
      resolve();
    });
  }

  public loadUserImages(userId: string, startFrom: number, itemCount: number): Promise<{ imagesCount: number, images: UploadedImage[] }> {
    return new Promise<{ imagesCount: number, images: UploadedImage[] }>((resolve, reject) => {
      resolve({
        imagesCount: IMAGES.length,
        images: IMAGES.slice(startFrom, startFrom + itemCount)
      });
    });
  }

  public loadImage(userId: string, imageId: string): Promise<UploadedImage> {
    return new Promise<UploadedImage>((resolve, reject) => {
      for (let i = 0; i < IMAGES.length; i++) {
        if (IMAGES[i].imageId == imageId) {
          resolve(IMAGES[i]);
          return;
        }
      }
      reject();
    });
  }

  public addTextRegion(userId: string, imageId: string, region: Region): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }
}
