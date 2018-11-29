import { Storage } from '@ionic/storage';
import { Injectable } from '@angular/core';
import { Puzzle } from './puzzle';
import { games4 } from './games-4';
import { games3 } from './games-3';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private storage: Storage) { }

  getByLevel(size: number, level: number): Puzzle {
    const puzzles = {
      3: games3,
      4: games4
      // 5: games5
    };

    const puzzle = puzzles[size][level];
    puzzle.level = level;
    return puzzle;
  }

  getPuzzleCount(): number {
    return games4.length;
  }

  async saveProgress(puzzle: Puzzle, score: number) {
    const size = puzzle.size / puzzle.solution.length;
    const progress: Map<number, number> = (await this.getHighestLevel()) || { size: 0 };
    // await this.storage.set('foreword-' + puzzle.solution[0].split('').sort(), score);
    progress[size] = Math.max(progress[size] || 0, puzzle.level);
    return this.storage.set('foreword-highest-level', progress);
  }

  getHighestLevel(): Promise<any> {
    return this.storage.get('foreword-highest-level');
  }

  async getRemainingHints(): Promise<number> {
    let hints = await this.storage.get('hints');
    if (hints === null) {
      // One time gift of hints
      hints = 100;
      await this.storage.set('hints', hints);
    }
    return hints;
  }

  async decrementHints(): Promise<number> {
    let hints = await this.getRemainingHints();
    hints--;
    await this.storage.set('hints', hints);
    return hints;
  }

  async addHints(hints: number) {
    const currentHints = await this.getRemainingHints();
    await this.storage.set('hints', hints + currentHints);
    return hints;
  }

  // private allPuzzles(): Puzzle[] {
  //   return [{ size: 4, 'solution': ['MADEAREADEAREARN'] },
  //   { 'size': 4, 'solution': ['RUSHUNTOSTEMHOME'] },
  //   { 'size': 4, 'solution': ['WILDIDEANESTDATE'] },
  //   { 'size': 4, 'solution': ['abetbabeebontend'] },
  //   { 'size': 4, 'solution': ['abetbabeebontent'] },
  //   { 'size': 4, 'solution': ['icedcaveevendent'] },
  //   { 'size': 4, 'solution': ['icedcaveevendeny'] },
  //   { 'size': 4, 'solution': ['icedcoveevendent'] },
  //   { 'size': 4, 'solution': ['icedcoveevendeny'] },
  //   { 'size': 8, 'solution': ['WIFEACIDLONGKNEE'] },
  //   { 'size': 8, 'solution': ['abetbabeerostent', 'abetbareebontest'] },
  //   { 'size': 8, 'solution': ['abetracemirestun', 'armsbaitecruteen'] },
  //   { 'size': 8, 'solution': ['cageheaturicmyth', 'chumaerygaitetch'] },
  //   { 'size': 8, 'solution': ['daftobeyclapketo', 'dockablefeattypo'] },
  //   { 'size': 8, 'solution': ['daftrileuricmyth', 'drumairyflittech'] },
  //   { 'size': 8, 'solution': ['daftuglypeakedge', 'dupeagedflagtyke'] },
  //   { 'size': 8, 'solution': ['iceddoveevenaery', 'ideacoveeverdeny'] },
  //   { 'size': 8, 'solution': ['iceddoveevensent', 'idescoveevendent'] },
  //   { 'size': 8, 'solution': ['iceddoveovenlent', 'idolcoveevendent'] },
  //   { 'size': 8, 'solution': ['massyeahtriohold', 'mythaerosailshod'] },
  //   { 'size': 8, 'solution': ['massyeahtriohole', 'mythaerosailshoe'] },
  //   { 'size': 8, 'solution': ['pactyeahroleonly', 'pyroaeoncallthey'] },
  //   { 'size': 8, 'solution': ['riotundostowtorn', 'rustintoodortown'] },
  //   { 'size': 8, 'solution': ['sackebonelsemete', 'seemablecostknee'] },
  //   { 'size': 8, 'solution': ['sackoboenudestep', 'sonsabutcodekeep'] },
  //   { 'size': 8, 'solution': ['sackoboenukestep', 'sonsabutcokekeep'] },
  //   { 'size': 8, 'solution': ['sackoboenullstep', 'sonsabutcolekelp'] },
  //   { 'size': 8, 'solution': ['wadeicedshaghere', 'wishachedearedge'] },
  //   { 'size': 8, 'solution': ['wadeicedsnaghere', 'wishacnedearedge'] },
  //   { 'size': 8, 'solution': ['wadeicedshagpyre', 'wispachydearedge'] },
  //   { 'size': 8, 'solution': ['wadereadaridposy', 'wrapaerodaiseddy'] },
  //   ];
  // }
}
