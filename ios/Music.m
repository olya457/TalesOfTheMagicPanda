#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import <AVFoundation/AVFoundation.h>

@interface Music : NSObject <RCTBridgeModule>
@end

@implementation Music {
  AVAudioPlayer *_player;
}

RCT_EXPORT_MODULE();
+ (BOOL)requiresMainQueueSetup { return NO; }

- (void)setupSessionIfNeeded {
  AVAudioSession *s = [AVAudioSession sharedInstance];
  NSError *err = nil;
  [s setCategory:AVAudioSessionCategoryPlayback
     withOptions:AVAudioSessionCategoryOptionMixWithOthers
           error:&err];
  if (err) { RCTLogError(@"[Music] setCategory error: %@", err); }
  [s setActive:YES error:&err];
  if (err) { RCTLogError(@"[Music] setActive error: %@", err); }
}

- (NSURL *)findBGM {

  NSArray<NSString *> *names = @[@"bgm", @"bgm1", @"bgm 1", @"bgm2", @"bgm 2", @"bgm3", @"bgm 3"];
  for (NSString *n in names) {
    NSURL *u = [[NSBundle mainBundle] URLForResource:n withExtension:@"mp3"];
    if (u) return u;
  }
  return nil;
}

RCT_EXPORT_METHOD(start) {
  dispatch_async(dispatch_get_main_queue(), ^{
    RCTLogInfo(@"[Music] start() called");
    if (self->_player && self->_player.isPlaying) {
      RCTLogInfo(@"[Music] already playing");
      return;
    }

    NSURL *url = [self findBGM];
    if (!url) {
  
      NSArray *all = [[NSBundle mainBundle] pathsForResourcesOfType:@"mp3" inDirectory:nil];
      RCTLogError(@"[Music] mp3 not found. Present in bundle: %@", all);
      return;
    }

    NSError *err = nil;
    self->_player = [[AVAudioPlayer alloc] initWithContentsOfURL:url error:&err];
    if (err || !self->_player) {
      RCTLogError(@"[Music] AVAudioPlayer init error: %@", err);
      return;
    }

    self->_player.numberOfLoops = -1;
    self->_player.volume = 1.0;
    [self->_player prepareToPlay];
    [self setupSessionIfNeeded];
    BOOL ok = [self->_player play];
    RCTLogInfo(@"[Music] play() -> %@", ok ? @"OK" : @"FAILED");
  });
}

RCT_EXPORT_METHOD(stop) {
  dispatch_async(dispatch_get_main_queue(), ^{
    RCTLogInfo(@"[Music] stop() called");
    if (self->_player) {
      [self->_player stop];
      self->_player = nil;
    }
    NSError *err = nil;
    [[AVAudioSession sharedInstance] setActive:NO error:&err];
    if (err) { RCTLogError(@"[Music] deact error: %@", err); }
  });
}

RCT_EXPORT_METHOD(setEnabled:(BOOL)on) {
  if (on) { [self start]; } else { [self stop]; }
}

@end
