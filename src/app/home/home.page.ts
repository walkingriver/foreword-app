import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  letters = [
    ['A', 'B', 'C', 'D'],
    ['E', 'F', 'G', 'H'],
    ['I', 'J', 'K', 'L'],
    ['M', 'N', 'O', 'P']
  ];

  solution = [
    ['A', 'B', 'C', 'D'],
    ['E', 'F', 'G', 'H'],
    ['I', 'J', 'K', 'L'],
    ['M', 'N', 'O', 'P']
  ];

  gameBoard = [
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
    ['*', '*', '*', '*'],
  ];

  dragOver(ev) {
    console.log('Drag Over: ', ev.target);
    ev.preventDefault();
  }

  dragStart(ev) {
    console.log('Drag Start:', ev.target);
    // Set the drag's format and data. Use the event target's id for the data.
    const values = ev.target.id.split('-');
    const dropSource: { set: string, row: number, col: number } = { set: '', row: -1, col: -1 };
    dropSource.set = values[0];
    dropSource.row = values[1];
    dropSource.col = values[2];
    ev.dataTransfer.setData('text/json', JSON.stringify(dropSource));
  }

  drop(ev) {
    ev.preventDefault();
    console.log(ev);
    // Get the data, which is the id of the drop target
    const dropSource = JSON.parse(ev.dataTransfer.getData('text/json'));
    // ev.target.appendChild(document.getElementById(data));
    const dropDest: { set: string, row: number, col: number } = { set: '', row: -1, col: -1 };
    [dropDest.set, dropDest.row, dropDest.col] = ev.target.id.split('-');
    console.log('Dropped: ', dropSource, dropDest);

    this.swapTiles(dropSource, dropDest);
  }

  swapTiles(source, destination) {
    const swapFn = {
      boardboard:  (src, dest) => {
        const tmp = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = this.gameBoard[src.row][src.col];
        this.gameBoard[src.row][src.col] = tmp;
      },
      boardtiles:  (src, dest) => {
        const tmp = this.letters[dest.row][dest.col];
        this.letters[dest.row][dest.col] = this.gameBoard[src.row][src.col];
        this.gameBoard[src.row][src.col] = tmp;
      },
      tilesboard:  (src, dest) => {
        const tmp = this.gameBoard[dest.row][dest.col];
        this.gameBoard[dest.row][dest.col] = this.letters[src.row][src.col];
        this.letters[src.row][src.col] = tmp;
      },
      tilestiles:  (src, dest) => {
        const tmp = this.letters[dest.row][dest.col];
        this.letters[dest.row][dest.col] = this.letters[src.row][src.col];
        this.letters[src.row][src.col] = tmp;
      }
    };

    const funcKey = source.set + destination.set;
    swapFn[funcKey](source, destination);
  }
}

