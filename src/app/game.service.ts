import { Injectable } from '@angular/core';
import { Puzzle } from './puzzle';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }

  getByLevel(level: number): Puzzle {
    const puzzles = this.allPuzzles();
    const puzzle = puzzles[level];
    puzzle.level = level;
    return puzzle;
  }

  getPuzzleCount(): number {
    return this.allPuzzles.length;
  }

  private allPuzzles(): Puzzle[] {
    return [
      {
        size: 4,
        solution: ['MADEAREADEAREARN']
      }, {
        size: 4,
        solution: ['RUSHUNTOSTEMHOME']
      }, {
        size: 4,
        solution: ['WILDIDEANESTDATE']
      }, {
        size: 8,
        solution: ['WIFEACIDLONGKNEE']
      }
    ];
  }
}
