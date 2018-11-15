const UUID = require('uuid/v4');
const Moment = require('moment');
const { performance } = require('perf_hooks');

const STEPS = ['BROWSE', 'ADD', 'CART', 'CHECKOUT'];

function interpolateCosine(p1, p2, mu) {

  const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
  return (p1 * (1 - mu2) + p2 * mu2);
}

class ShoppingFeed {

  constructor(config, output, progress, ending) {

    this.config = config;
    this.output = output;
    this.progress = progress;
    this.ending = ending;
    this.productPickList = [];
    for (const product of Object.keys(this.config.products)) {
      let pick = this.config.products[product].weight;
      while (pick > 0) {
        this.productPickList.push(product);
        pick--;
      }
    }
    this.counts = {
      BROWSE: 0,
      ADD: 0,
      WISHLIST: 0,
      CART: 0,
      CHECKOUT: 0,
      TOTAL: 0,
      SESSIONS: 0
    }
    this.start = Moment(this.config.startTime);
    this.now = this.start.clone();
    this.lastEvent = performance.now();
    this.lastTimeout = 0;
    this.end = Moment(this.config.endTime);
    this.campaignStart = Moment(config.campaignTime);

    this.afterCampaign = false;
    this.lastProgress = this.now.clone();

    const volume = this.getVolume();
    this.sessions = new Map();
    for (let i = 0; i < Math.ceil(this.config.maxSessions
    * volume); i++) {
      this.createSession();
    }
  }

  createSession() {

    const id = UUID();
    let campaign = null;
    if (this.afterCampaign && Math.random() < this.config.campaignPercentage) {
      campaign = this.config.campaign;
    }
    this.sessions.set(id,{
      id,
      start: this.now.clone(),
      last: null,
      campaign: campaign,
      step: 0,
      cart: 0
    });
    this.sessionKeys = [...this.sessions.keys()];
    this.counts.SESSIONS++;
    return this.sessions.get(id);
  }

  destroySession(id) {

    if (typeof id === 'undefined' || id === null) {
      const id = this.sessionKeys[Math.floor(Math.random() * this.sessions.size)];
    }
    this.sessions.delete(id);
    this.sessionKeys = [...this.sessions.keys()];
  }

  getVolume() {

    const hour = this.now.hours();
    const hourRound = this.now.clone().minutes(0).seconds(0);
    const next = this.now.clone().add(1, 'hour');
    let volume1 = this.config.volume[hour];
    let volume2 = this.config.volume[next.hours()];
    if (hourRound.isAfter(this.campaignStart)) {
      volume1 *= this.config.campaignVolumeMult;
    }
    if (next.isAfter(this.campaignStart)) {
      volume2 *= this.config.campaignVolumeMult;
    }
    let mu = (this.now.minute() * 60 + this.now.seconds()) / 60 / 60;
    let volume = interpolateCosine(volume1, volume2, mu);
    volume = volume / this.config.campaignVolumeMult;
    return volume;
  }

  getWait(volume) {

    return (1 - volume) * this.config.maxWait * 2 * Math.random();
    if (wait < 0) {
      throw new Error();
    }
  }

  pickProduct() {
    const product = this.productPickList[
      Math.floor(
        Math.random() * this.productPickList.length
      )
    ];
    return product;
  }

  generateEvent(volume) {

    let session = null;
    while(session === null) {
      if (
        (this.sessions.size < this.config.maxSessions * volume
          && Math.random() < .8) || this.sessions.size < 50)
      {
        session = this.createSession();
      } else {
        const idx = Math.floor(Math.random() * this.sessions.size);
        session = this.sessions.get(this.sessionKeys[idx])
        if (session.start.diff(this.now, 'hours') <= -2) {
          this.destroySession(session.id);
          session = null;
        }
      }
    }
    let step = STEPS[session.step];
    if (
      step === 'ADD'
      && this.config.products[session.last].category != this.config.badCategory
      && (
        (session.campaign !== null && Math.random() < .9)
        || (session.campaign === null && Math.random() < .1)
      )
    ) {
      step = 'WISHLIST';
    }
    const event = {
      time: this.now.format(),
      session: session.id,
      action: step,
      product: '',
      category: '',
      campaign: session.campaign || ''
    };
    this.counts[step]++;
    this.counts.TOTAL++;
    if (step === 'BROWSE') {
      const product = this.pickProduct();
      event.product = product;
      event.category = this.config.products[product].category;
      session.last = product;
      if (Math.random() < .3) {
        session.step++;
      }
    } else if (step === 'ADD') {
      event.product = session.last;
      session.cart++;
      event.category = this.config.products[session.last].category;
      if (session.cart >= 5 || Math.random() + session.cart / 10 > .8) {
          session.step++;
      } else {
          session.step--;
      }
    } else if (step === 'WISHLIST') {
      event.product = session.last;
      event.category = this.config.products[session.last].category;
      session.step--;
    } else if (step === 'CART') {
      session.step++;
    } else if (step === 'CHECKOUT') {
    }
    if (
      step === 'CHECKOUT'
      || (step.cart === 0 && Math.random() < .5)
      || Math.random() < .3
    ) {
      this.destroySession(session.id);
    }
    if (this.sessions.size > this.config.maxSessions * volume) {
      this.destroySession();
    }
    return event;
  }

  async updateBatch(until) {

    if (!this.afterCampaign && this.now.isAfter(this.campaignStart)) {
      this.afterCampaign = true;
    }
    const volume = this.getVolume();
    const wait = this.getWait(volume);
    this.now.add(wait, 'seconds');
    const event = this.generateEvent(volume);

    if (this.now.diff(this.lastProgress, 'ms') >= 500) {
      this.lastProgress = this.now.clone();
      this.progress(this.now)
    }
    if (!this.config.skipBatchEvents) {
      await this.output(event);
    }

    if (!this.now.isAfter(this.end) && ((until && !this.now.isAfter(until)) || !until)) {
      process.nextTick(() => {
        this.updateBatch(until);
      });
    } else {
      console.log(this.counts);
      this.ending();
    }
  }

  async updateLive() {

    if (!this.afterCampaign && this.now.isAfter(this.campaignStart)) {
      this.afterCampaign = true;
    }
    const now = performance.now();
    const delta = now - this.lastEvent;
    this.lastEvent = now;

    const volume = this.getVolume();
    const wait = this.getWait(volume);
    this.now.add(wait, 'seconds');
    const event = this.generateEvent(volume);
    const timeout = wait * 1000 - (delta - this.lastTimeout);
    this.lastTimeout = timeout;

    if (this.now.diff(this.lastProgress, 'ms') >= 500) {
      this.lastProgress = this.now.clone();
      this.progress(this.now)
    }

    await this.output(event);

    if (!this.now.isAfter(this.end)) {
      if (timeout > 0) {
        setTimeout(() => {
          this.updateLive();
        }, timeout);
      } else {
        process.nextTick(() => {
          this.updateLive();
        });
      }
    } else {
      console.log(this.counts);
      this.ending();
    }
  }

}

module.exports = ShoppingFeed;
