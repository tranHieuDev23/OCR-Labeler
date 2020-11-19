import { Coordinate } from "src/app/models/text-region";

export class RegionSelectorState {
    constructor(
        public readonly imageElement: HTMLImageElement,
        public readonly selectedCoordinates: Coordinate[],
        public readonly dragCoordinates: { start: Coordinate, end: Coordinate },
        public readonly highlightedCoordinates: Coordinate[][],
    ) { }

    public cloneWithImageElement(imageElement: HTMLImageElement): RegionSelectorState {
        return new RegionSelectorState(
            imageElement,
            this.selectedCoordinates,
            this.dragCoordinates,
            this.highlightedCoordinates
        );
    }

    public cloneWithSelectedCoordinates(selectedCoordinates: Coordinate[]): RegionSelectorState {
        return new RegionSelectorState(
            this.imageElement,
            selectedCoordinates,
            this.dragCoordinates,
            this.highlightedCoordinates
        );
    }

    public cloneWithDragCoordinates(dragCoordinates: { start: Coordinate, end: Coordinate }): RegionSelectorState {
        return new RegionSelectorState(
            this.imageElement,
            this.selectedCoordinates,
            dragCoordinates,
            this.highlightedCoordinates
        );
    }

    public cloneWithHighlightCoordinates(highlightedCoordinates: Coordinate[][]): RegionSelectorState {
        return new RegionSelectorState(
            this.imageElement,
            this.selectedCoordinates,
            this.dragCoordinates,
            highlightedCoordinates
        );
    }
}