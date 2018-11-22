import { Component, isDevMode, OnInit } from '@angular/core';
import { Puzzle } from '../puzzle';
import { GameService } from '../game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  puzzle: Puzzle =
    {
      level: 0,
      size: 4,
      solution: ['MADEAREADEAREARN']
      // solution: ['FOURWORDACESMAST']
    };

  letters = []; // this.puzzle.solution.split('').sort();
  totalMoves = 0;
  isDebugging: boolean = isDevMode();
  isMuted: boolean;
  gameSize = 4;

  gameBoard = [
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
  ];

  isDragging = false;
  gameOver: boolean;
  isRecycling: boolean;
  dropSounds: HTMLAudioElement[] = [];
  shuffleSound: HTMLAudioElement;
  soundFiles = 4;
  order: number;

  constructor(private alertController: AlertController,
    private games: GameService,
    private router: Router,
    route: ActivatedRoute) {
    this.gameSize = route.snapshot.params['order'];
  }

  async ngOnInit() {
    this.loadSounds();
    const progress = await this.games.getHighestLevel();
    let nextLevel = 0;
    if (progress[this.gameSize]) {
      nextLevel = progress[this.gameSize] + 1;
    }
    this.loadLevel(nextLevel);
  }

  async loadSounds(): Promise<void> {
    this.dropSounds['boardboard'] = new Audio('./assets/sounds/boardboard.wav');
    this.dropSounds['boardshelf'] = new Audio('./assets/sounds/boardshelf.wav');
    this.dropSounds['shelfboard'] = new Audio('./assets/sounds/shelfboard.wav');
    this.dropSounds['shelfshelf'] = new Audio('./assets/sounds/shelfshelf.wav');
    this.shuffleSound = new Audio('./assets/sounds/shuffle.wav');
  }

  private loadLevel(level: number) {
    this.puzzle = this.games.getByLevel(this.gameSize, level);
    this.newGame();
  }

  async newGame() {
    if (!this.isMuted) {
      try {
        await this.shuffleSound.play();
      } catch (error) {
        // We can ignore this error.
      }
    }

    this.gameOver = false;
    this.totalMoves = 0;

    // This will either compute to 3, 4, or 5.
    const square = this.puzzle.size / this.puzzle.solution.length;

    this.gameBoard = [];

    for (let i = 0; i < square; i++) {
      const row = [];
      for (let j = 0; j < square; j++) {
        row.push('*');
      }
      this.gameBoard.push(row);
    }

    this.letters = this.puzzle.solution[0].split('').sort();
  }

  resetGame() {
    if (this.totalMoves) {
      this.presentAlertConfirm(() => this.newGame());
    } else {
      this.newGame();
    }
  }

  nextLevel() {
    this.loadLevel(this.puzzle.level + 1);
  }

  prevLevel() {
    this.loadLevel(this.puzzle.level - 1);
  }

  startPage() {
    if (this.totalMoves) {
      this.presentAlertConfirm(() => this.goToStart());
    } else {
      this.goToStart();
    }
  }

  goToStart() {
    this.router.navigateByUrl('/Start');
  }

  async presentAlertConfirm(successFn) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'This will reset your game in progress.',
      cssClass: 'panel',
      buttons: [
        {
          text: 'Nevermind',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'OK',
          handler: () => {
            successFn();
          }
        }
      ]
    });

    await alert.present();
  }

  async winLevel() {
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

  dragStart(ev, source, row, col, letter) {
    // dragStart($event, 'board', row, col, c)
    this.isDragging = true;

    // Set the drag's format and data. Use the event target's id for the data.
    const dropSource = {
      set: source,
      row: row,
      col: col,
      letter: letter
    };

    ev.dataTransfer.setData('text/json', JSON.stringify(dropSource));
    ev.dataTransfer.effectAllowed = 'move';
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

  async drop(ev, dest, row, col) {
    // drop($event, 'board', row, col)
    ev.preventDefault();
    // console.log(ev);

    // Get the data, which is the id of the drop target
    const dropSource = JSON.parse(ev.dataTransfer.getData('text/json'));
    const dropDest = { set: dest, row: row, col: col };
    // console.log('Dropped: ', dropSource, dropDest);

    await this.swapTiles(dropSource, dropDest);

    this.dragEnd(ev);

    if (this.testGame()) {
      this.gameOver = true;
      await this.games.saveProgress(this.puzzle, this.totalMoves);
    }
  }

  isLetter(val) {
    return (/[A-Za-z]/.test(val));
  }

  async swapTiles(source, destination) {
    const swapFn = {
      boardboard: (src, dest) => {
        // Dragging a tile from one game board cell to another.
        this.gameBoard[src.row][src.col] = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = src.letter;
        this.totalMoves++;
      },
      shelfshelf: (src, dest) => {
        // No-op
      },
      shelfboard: (src, dest) => {
        // Dragging a tile from the shelf to the game board.
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
      boardshelf: (src, dest) => { // Dragging a tile from the game board to the shelf.
        this.letters.push(this.gameBoard[src.row][src.col]);
        this.gameBoard[src.row][src.col] = '*';
        this.totalMoves++;
      }
    };

    const funcKey = source.set + destination.set;
    swapFn[funcKey](source, destination);

    if (!this.isMuted) {
      try {

        await this.dropSounds[funcKey].play();
      } catch (e) {
        // It's OK to ignore a sound play error
      }
    }
  }
}

