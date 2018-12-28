import { Component, OnInit } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  currentLevel: { 3: 0, 4: 0, 5: 0 };
  maxLevel: { 3: 0, 4: 0, 5: 0 };

  constructor(
    private games: GameService,
  ) {

  }

  async ngOnInit() {
    this.currentLevel = (await this.games.getHighestLevel()) || { 3: 0, 4: 0, 5: 0 };
  }

  progress(order: number) {
    if (!this.currentLevel) { return 1; }

    let level = this.currentLevel[order] || 0;
    return ++level;
  }

  progressUrl(order: number) {
    if (!this.currentLevel) { return `/home/${order}/1`; }

    let level = this.currentLevel[order] || 0;
    level++;
    return `/home/${order}/${level}`;
  }

  randomUrl(order: number) {
    const nextLevel = this.games.getRandomLevel(order);
    return `/home/${order}/${nextLevel}`;
  }
}
