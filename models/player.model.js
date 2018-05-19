exports.Player = class Player {
  constructor(user) {
    this.user = user;
    this.faction = undefined;
    this.hitler = false;
    this.president = false;
    this.chancellor = false;
    this.executed = false;
    this.chancellorVote = null;
  }

  castVote(vote) {
    this.chancellorVote = vote;
  }

  execute() {
    this.executed = true;
  }

  makePresident() {
    this.president = true;
  }

  makeChancellor() {
    this.chancellor = true;
  }

  makeFascist() {
    this.faction = 'fascist';
  }

  makeLiberal() {
    this.faction = 'liberal';
  }

  makeHitler() {
    this.hitler = true;
  }

  isHitler() {
    return this.hitler;
  }
}