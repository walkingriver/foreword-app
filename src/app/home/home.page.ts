import { Component, isDevMode, OnInit } from '@angular/core';
import { Puzzle } from '../puzzle';
import { GameService } from '../game.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { AdMobFreeInterstitialConfig, AdMobFree } from '@ionic-native/admob-free/ngx';
import { GameBoardSquare } from '../game-board-square';

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

  letters: GameBoardSquare[] = []; // this.puzzle.solution.split('').sort();
  totalMoves = 0;
  hintsUsed = 0;
  isDebugging: boolean = isDevMode();
  isMuted: boolean;
  gameSize = 4;

  gameBoard: GameBoardSquare[][] = [
    [{ letter: '*' }, { letter: '*' }, { letter: '*' }, { letter: '*' }],
    [{ letter: '*' }, { letter: '*' }, { letter: '*' }, { letter: '*' }],
    [{ letter: '*' }, { letter: '*' }, { letter: '*' }, { letter: '*' }],
    [{ letter: '*' }, { letter: '*' }, { letter: '*' }, { letter: '*' }],
  ];

  isDragging = false;
  gameOver: boolean;
  isRecycling: boolean;
  dropSounds: HTMLAudioElement[] = [];
  shuffleSound: HTMLAudioElement;
  soundFiles = 4;
  order: number;
  isiOS: boolean;
  hints: number;
  interval: number;
  hintOrder: number[];
  level: any;

  constructor(
    private admob: AdMobFree,
    private alertController: AlertController,
    private games: GameService,
    private platform: Platform,
    private router: Router,
    private toastController: ToastController,
    route: ActivatedRoute) {
    this.gameSize = route.snapshot.params['order'];
    this.level = route.snapshot.params['level'];
  }

  async ngOnInit() {
    await this.platform.ready();
    this.isiOS = this.platform.is('ios');
    this.loadSounds();
    this.hints = await this.games.getRemainingHints();
    const progress = (await this.games.getHighestLevel()) || { 3: 0, 4: 0, 5: 0 };

    let nextLevel = 0;
    if (this.level === 'next') {
      if (progress[this.gameSize]) {
        nextLevel = progress[this.gameSize] + 1;
      }
    } else if (this.level === 'random') {
      this.randomLevel();
    } else {
      nextLevel = this.level;
      this.loadLevel(nextLevel);
    }
  }

  setupHintTimer() {
    // this.interval = window.setInterval(() => { this.suggestHint(); }, 30000);
  }

  clearHintTimer() {
    // window.clearInterval(this.interval);
  }

  canHint() {
    return this.hintOrder && this.hintOrder.length && this.hints && !this.gameOver;
  }

  addHints(hints: number) {
    this.games.addHints(hints);
  }

  async suggestHint() {
    const toast = await this.toastController.create({
      message: 'Need a hint? Click the light bulb in the title bar.',
      position: 'bottom',
      duration: 2500,
      translucent: true
    });
    toast.present();
  }

  async useHint() {
    // Figure out how to use a hint here.
    // First, get the "next" element from the hint order.
    const position = this.hintOrder.shift();

    // We'll always work from the first solution, since we have no way
    // really to know which one the player is close to solving (or if
    // there is even more than one at this point).
    const letter = this.puzzle.solution[0][position];

    // Now convert the position to the grid col,row;
    const row = Math.floor(position / this.gameSize);
    const col = position % this.gameSize;
    const targetTile = this.gameBoard[row][col];

    // Remove whatever tile that may already be there
    if (this.isLetter(targetTile.letter)) {
      this.letters.push({ letter: targetTile.letter });
    }

    // Now the tile is empty, ready to receive this one.
    // Now there are two possibilities
    // a. The one we need is on the shelf, which is what we want
    const shelfIndex = this.letters.findIndex((val) => val.letter === letter);
    if (shelfIndex >= 0) {
      // Remove it from the shelf
      this.letters.splice(shelfIndex, 1);

      // Add it to the board.
      targetTile.letter = letter;
    } else {
      // b. The one we need is on the board.
      const boardTile = ([] as GameBoardSquare[])
        .concat(...this.gameBoard)
        .find(val => (val.letter === letter) && (!val.isLocked));

      // Put it where it belongs and lock it.
      targetTile.letter = boardTile.letter;
      targetTile.isLocked = true;

      // And empty the square it used to occupy
      boardTile.letter = '*';
    }

    // And lock it
    targetTile.isLocked = true;

    // Then decrement the hints.
    this.hints = await this.games.decrementHints();
    this.hintsUsed++;

    // And finally, check to see if the game is won.
    this.testGame();
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
      this.shuffleSound
        .play()
        .catch(error => {
          // We can ignore sound player errors
        });
    }

    this.gameOver = false;
    this.totalMoves = 0;
    this.hintsUsed = 0;

    // This will either compute to 3, 4, or 5.
    const square = this.puzzle.size / this.puzzle.solution.length;

    this.gameBoard = [];

    for (let i = 0; i < square; i++) {
      const row = [];
      for (let j = 0; j < square; j++) {
        row.push({ letter: '*', isLocked: false });
      }
      this.gameBoard.push(row);
    }

    this.letters =
      this.puzzle.solution[0]
        .split('')
        .sort()
        .map((e) => ({ letter: e }));

    if (this.puzzle.level % 3 === 0) {
      this.launchInterstitial();
    }

    this.setupHintTimer();
    this.prepareHints();
  }

  /**
   * Shuffles the solution positions so that we can offer "random"
   * hints without duplication.
   */
  prepareHints() {
    const total = this.puzzle.solution[0].length;
    const hintOrder = Array.from(Array(total).keys());
    this.hintOrder = this.shuffle(hintOrder);
  }

  /**
   * Shuffles array in place. ES6 version
   * @param {Array} An array containing the items.
   */
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  launchInterstitial() {
    try {
      const interstitialConfig: AdMobFreeInterstitialConfig = {
        isTesting: this.isDebugging,
        autoShow: true,
        id: this.isiOS
          ? 'ca-app-pub-5422413832537104/6868524515'
          : 'ca-app-pub-5422413832537104/2046732230'
      };

      this.admob.interstitial.config(interstitialConfig);

      this.admob.interstitial.prepare().then(() => {
        // success
      });
    } catch (e) {
      // We can ignore errors due to admob and cordova here
    }
  }

  resetGame() {
    if (this.totalMoves) {
      this.presentAlertConfirm(() => this.newGame());
    } else {
      this.newGame();
    }
  }

  nextGame() {
    if (this.level === 'random') {
      this.randomLevel();
    } else if (this.level === 'next') {
      this.nextLevel();
    } else {
      // number
      // Do something else here, but what?
    }
  }

  nextLevel() {
    this.loadLevel(this.puzzle.level + 1);
  }

  randomLevel() {
    const nextLevel = this.games.getRandomLevel(this.gameSize);
    this.loadLevel(nextLevel);
  }

  prevLevel() {
    this.loadLevel(this.puzzle.level - 1);
  }

  startPage() {
    if (!this.gameOver && this.totalMoves) {
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

  winLevel() {
    this.gameOver = false;
    this.gameBoard = this.puzzleToGameBoard(this.puzzle);
    this.gameBoard[0][0] = { letter: '*' };
    this.letters = [];
    this.letters.push({ letter: this.puzzle.solution[0][0] });
  }

  shuffleLevel() {
    this.gameOver = false;
    this.gameBoard = this.stringToGameBoard(this.puzzle.solution[0].split('').sort());
    this.letters = [];
  }

  puzzleToGameBoard(puzzle): GameBoardSquare[][] {
    const letters: string[] = puzzle.solution[0].split('');
    return this.stringToGameBoard(letters);
  }

  stringToGameBoard(letters) {
    const size = Math.sqrt(letters.length);
    const board: GameBoardSquare[][] = [];
    letters.forEach((v, i) => {
      const row = Math.floor(i / size);
      const col = i % size;
      if (col === 0) {
        board[row] = [];
      }
      board[row][col] = { letter: v };
    });

    return board;
  }

  async testGame() {
    const currentSolution = this.gameBoardToString();
    let isWon = false;

    this.puzzle.solution.forEach(p => {
      if (p === currentSolution) {
        isWon = true;
      }
    });

    if (isWon) {
      this.gameOver = true;
      await this.games.saveProgress(this.puzzle, this.totalMoves);
      this.clearHintTimer();
    } else {
      this.setupHintTimer();
    }
  }

  gameBoardToString() {
    let board = '';
    this.gameBoard.forEach((row) => {
      row.forEach((col) => {
        board += col.letter;
      });
    });

    return board;
  }

  url(val: string) {
    const letter = val.toLowerCase();
    return `./assets/images/${letter}.png`;
  }

  isDragSource(val: GameBoardSquare): boolean {
    return !this.gameOver && !val.isLocked && (/[A-Za-z]/.test(val.letter));
  }

  isDropTarget(val: GameBoardSquare): boolean {
    return !this.gameOver && !val.isLocked;
  }

  dragOver(ev) {
    // console.log('Drag Over: ', ev.target);
    ev.preventDefault();
    ev.stopPropagation();
  }

  dragStart(ev, source, row, col, letter) {
    // dragStart($event, 'board', row, col, c)
    this.isDragging = true;
    this.clearHintTimer();

    // Set the drag's format and data. Use the event target's id for the data.
    const dropSource = {
      set: source,
      row: row,
      col: col,
      letter: letter
    };

    ev.dataTransfer.setData('text/json', JSON.stringify(dropSource));
    ev.dataTransfer.effectAllowed = 'move';

    // Remove the letter from the drag source
    // window.setTimeout( () => {
    //   if (dropSource.set === 'board') {
    //     this.gameBoard[dropSource.row][dropSource.col] = { letter: '*' };
    //   } else {
    //     this.letters.splice(row, 1);
    //   }
    // }, 5);
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
    this.setupHintTimer();
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

    this.testGame();
  }

  isLetter(val) {
    return (/[A-Za-z]/.test(val));
  }

  async swapTiles(source, destination) {
    const swapFn = {
      boardboard: (src, dest) => {
        // Dragging a tile from one game board cell to another.
        this.gameBoard[src.row][src.col] = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = src;
        this.totalMoves++;
      },
      shelfshelf: (src, dest) => {
        // No-op
      },
      shelfboard: (src, dest) => {
        // Dragging a tile from the shelf to the game board.
        const tmp = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = this.letters[src.row];
        if (this.isLetter(tmp.letter)) {
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
        this.gameBoard[src.row][src.col] = { letter: '*' };
        this.totalMoves++;
      }
    };

    const funcKey = source.set + destination.set;
    swapFn[funcKey](source, destination);

    if (!this.isMuted) {
      this.dropSounds[funcKey]
        .play()
        .catch(error => {
          // We can ignore sound player errors
        });
    }
  }
}

