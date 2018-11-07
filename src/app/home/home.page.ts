import { Component, isDevMode } from '@angular/core';
import { Puzzle } from '../puzzle';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  puzzle: Puzzle =
    {
      level: 0,
      size: 4,
      solution: ['MADEAREADEAREARN']
    };

  letters = []; // this.puzzle.solution.split('').sort();
  totalMoves = 0;
  isDebugging: boolean = isDevMode();
  isMuted: boolean;

  gameBoard = [
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
  ];

  isDragging = false;
  gameOver: boolean;
  isRecycling: boolean;

  constructor(private games: GameService) {
    // Todo: Find out what level the player is on.
    // Then use that level instead of 0.
    this.loadLevel(0);
  }

  private loadLevel(level: number) {
    this.puzzle = this.games.getByLevel(level);
    this.newGame();
  }

  async newGame() {
    if (!this.isMuted) {
      try {
        const audio = new Audio('./src/assets/sounds/shuffle.wav');
        await audio.play();
      } catch (error) {
        // We can ignore this error.
      }
    }

    this.gameOver = false;
    this.gameBoard = [
      ['*', '*', '*', '*'],
      ['*', '*', '*', '*'],
      ['*', '*', '*', '*'],
      ['*', '*', '*', '*'],
    ];

    this.letters = this.puzzle.solution[0].split('').sort();
  }

  nextLevel() {
    this.loadLevel(this.puzzle.level + 1);
  }

  prevLevel() {
    this.loadLevel(this.puzzle.level - 1);
  }

  winLevel() {
    this.isRecycling = true;
    this.gameOver = false;
    setTimeout(() => {
      this.gameBoard = this.puzzleToGameBoard(this.puzzle);
      this.gameBoard[0][0] = '*';
      this.letters = [];
      this.letters.push(this.puzzle.solution[0][0]);
      this.isRecycling = false;
    }, 1000);
  }

  puzzleToGameBoard(puzzle): string[][] {
    const size = Math.sqrt(puzzle.solution[0].length);
    const board: string[][] = [];
    const letters: string[] = puzzle.solution[0].split('');

    letters.forEach((v, i) => {
      const row = Math.floor(i / size);
      const col = i % size;
      if (col === 0) {
        board[row] = [];
      }
      board[row][col] = v;
    });

    return board;
  }

  testGame() {
    return this.gameBoardToString() === this.puzzle.solution[0];
  }

  gameBoardToString() {
    let board = '';
    this.gameBoard.forEach((row) => {
      board += row.join('');
    });

    return board;
  }

  url(val: string) {
    const letter = val.toLowerCase();
    return `./assets/images/${letter}.png`;
  }

  canDrag(val) {
    return !this.gameOver && (/[A-Za-z]/.test(val));
  }

  dragOver(ev) {
    // console.log('Drag Over: ', ev.target);
    ev.preventDefault();
    ev.stopPropagation();
  }

  dragStart(ev) {
    this.isDragging = true;
    // console.log('Drag Start:', ev.target);
    // Set the drag's format and data. Use the event target's id for the data.
    const values = ev.target.id.split('-');
    const dropSource: { set: string, row: number, col: number } = { set: '', row: -1, col: -1 };
    dropSource.set = values[0];
    dropSource.row = values[1];
    dropSource.col = values[2];
    ev.dataTransfer.setData('text/json', JSON.stringify(dropSource));
    ev.dataTransfer.effectAllowed = 'copyLink';
  }

  dragEnter(ev) {
    ev.preventDefault();
    ev.stopPropagation(); // stop it here to prevent it bubble up
    const element = <HTMLElement>(ev.currentTarget);
    if (element) {
      element.classList.add('hover');
    }
    // console.log('Enter:', ev);
  }

  dragLeave(ev: DragEvent) {
    ev.stopPropagation(); // stop it here to prevent it bubble up
    const element = <HTMLElement>(ev.currentTarget);
    if (element) {
      element.classList.remove('hover');
    }
    // console.log('Leave:', ev);
  }

  dragEnd(ev) {
    this.isDragging = false;
    const elements = document.getElementsByClassName('hover');
    Array.from(elements).forEach((e) => e.classList.remove('hover'));
    // console.log('End:', ev.dataTransfer.dropEffect);
  }

  async drop(ev) {
    ev.preventDefault();
    // console.log(ev);
    // Get the data, which is the id of the drop target
    const dropSource = JSON.parse(ev.dataTransfer.getData('text/json'));
    // ev.target.appendChild(document.getElementById(data));
    const dropDest: { set: string, row: number, col: number } = { set: '', row: -1, col: -1 };
    [dropDest.set, dropDest.row, dropDest.col] = ev.currentTarget.id.split('-');
    // console.log('Dropped: ', dropSource, dropDest);

    this.swapTiles(dropSource, dropDest);

    if (!this.isMuted) {
      const soundFiles = 4;
      const whichSound = Math.floor(Math.random() * soundFiles) + 1;
      const sound = new Audio(`./assets/sounds/drop${whichSound}.wav`);
      await sound.play();
    }

    if (this.testGame()) {
      this.gameOver = true;
    }
  }

  isLetter(val) {
    return (/[A-Za-z]/.test(val));
  }

  swapTiles(source, destination) {
    const swapFn = {
      boardboard: (src, dest) => { // Dragging a tile from one game board cell to another.
        const tmp = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = this.gameBoard[src.row][src.col];
        this.gameBoard[src.row][src.col] = tmp;
        this.totalMoves++;
      },
      boardtiles: (src, dest) => {  // No-op
        // const tmp = this.letters[dest.row][dest.col];
        // this.letters[dest.row] = this.gameBoard[src.row][src.col];
        // this.gameBoard[src.row][src.col] = tmp;
      },
      tilesboard: (src, dest) => { // Dragging a tile from the shelf to the game board.
        const tmp = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = this.letters[src.row];
        if (this.isLetter(tmp)) {
          // Swap
          this.letters[src.row] = tmp;
        } else {
          // Remove it
          this.letters.splice(src.row, 1);
        }
        this.totalMoves++;
      },
      tilestiles: (src, dest) => {  // No-op
        // const tmp = this.letters[dest.row][dest.col];
        // this.letters[dest.row] = this.letters[src.row];
        // this.letters[src.row] = tmp;
      },
      boardshelf: (src, dest) => { // Dragging a tile from the game board to the shelf.
        this.letters.push(this.gameBoard[src.row][src.col]);
        this.gameBoard[src.row][src.col] = '*';
        this.totalMoves++;
      },
      tilesshelf: (src, dest) => { // No-op
        // this.letters.push(this.gameBoard[src.row][src.col]);
        // this.gameBoard[src.row][src.col] = '*';
      }
    };

    const funcKey = source.set + destination.set;
    swapFn[funcKey](source, destination);
  }
}

