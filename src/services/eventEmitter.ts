import { EventEmitter } from 'events';

class NavigationEventEmitter extends EventEmitter {
  emitOnboardingComplete() {
    console.log('🎯 Emitting onboarding-complete event');
    this.emit('onboarding-complete');
  }
}

export const navigationEvents = new NavigationEventEmitter();