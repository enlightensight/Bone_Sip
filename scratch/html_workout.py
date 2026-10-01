"""Swap the old exercise markup + timer modal for the guided-workout sheet and player."""
import pathlib
import re

p = pathlib.Path('index.html')
s = p.read_text(encoding='utf-8')

# 1. Exercise tab is fully rendered by renderBuildExerciseView().
s, n = re.subn(r'      <!-- EXERCISE -->\n      <div id="buildSubViewExercise" style="display: none;">.*?\n      </div>\n    </section>',
               '      <!-- EXERCISE (rendered by renderBuildExerciseView) -->\n      <div id="buildSubViewExercise" class="wk" style="display: none;"></div>\n    </section>',
               s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('exercise block not found')

# 2. Old timer modal -> detail sheet + full-screen player.
new_ui = '''  <!-- =========================================================================
       EXERCISE DETAIL SHEET
       ========================================================================= -->
  <div class="modal-backdrop exd-backdrop" id="exDetailSheet" style="display: none;">
    <div class="modal-card exd-card" role="dialog" aria-label="Exercise details">
      <div id="exDetailBody"></div>
      <div class="exd-footer">
        <button class="btn btn-outline" onclick="BoneApp.startDetailExercise('group')"><i class="fa-solid fa-list"></i> Whole group</button>
        <button class="cta-btn" onclick="BoneApp.startDetailExercise('one')"><i class="fa-solid fa-play"></i> Start</button>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       FULL-SCREEN WORKOUT PLAYER (ready → move → rest → … → done)
       ========================================================================= -->
  <div class="player" id="workoutPlayer" hidden role="dialog" aria-label="Workout player">
    <div class="pl-top">
      <button class="pl-icon" onclick="BoneApp.closePlayer()" aria-label="End workout"><i class="fa-solid fa-xmark"></i></button>
      <div class="pl-segs" id="plSegs"></div>
      <button class="pl-icon" id="plVoiceBtn" onclick="BoneApp.toggleVoice()" aria-label="Voice guide"><i class="fa-solid fa-volume-high"></i></button>
    </div>

    <div class="pl-stage">
      <div class="pl-media" id="plMedia"></div>
      <div class="pl-ready" id="plReady" hidden>
        <span class="pl-ready-label">Get ready</span>
        <b id="plReadyNum">10</b>
        <span class="pl-ready-name" id="plReadyName"></span>
        <button class="pl-ready-btn" onclick="BoneApp.playerSkip()">Start now <i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>

    <div class="pl-info">
      <span class="pl-count" id="plCount"></span>
      <h2 class="pl-name" id="plName"></h2>
      <span class="pl-reps" id="plReps"></span>
      <div class="pl-timer" id="plTimer" aria-live="off">00:00</div>
      <div class="pl-bar"><i id="plBar"></i></div>
      <div class="pl-controls">
        <button class="cta-btn pl-main" id="plPauseBtn" onclick="BoneApp.playerTogglePause()"><i class="fa-solid fa-pause"></i> Pause</button>
        <button class="pl-skip" onclick="BoneApp.playerSkip()"><i class="fa-solid fa-forward-step"></i> Skip</button>
      </div>
      <p class="pl-safety"><i class="fa-solid fa-shield-heart"></i> <span id="plSafety"></span></p>
      <p class="pl-next" id="plNext"></p>
    </div>

    <div class="pl-rest" id="plRest" hidden>
      <div class="pl-rest-top">
        <span class="pl-rest-label">Rest</span>
        <div class="pl-rest-timer" id="plRestTimer">00:10</div>
        <div class="pl-bar light"><i id="plRestBar"></i></div>
        <div class="pl-rest-actions">
          <button onclick="BoneApp.playerAddRest()"><i class="fa-solid fa-plus"></i> 10 s</button>
          <button class="solid" onclick="BoneApp.playerSkip()">Skip rest <i class="fa-solid fa-forward"></i></button>
        </div>
        <p class="pl-rest-tip"><i class="fa-solid fa-mug-hot"></i> Breathe slowly. Sip some water if you need it.</p>
      </div>
      <div class="pl-rest-next">
        <div class="pl-rest-next-head">
          <div><span id="plRestNextLabel">Next</span><b id="plRestNextName"></b></div>
          <span class="pl-rest-time" id="plRestNextTime"></span>
        </div>
        <div class="pl-rest-preview" id="plRestPreview"></div>
      </div>
    </div>

    <div class="pl-done" id="plDone" hidden>
      <img class="i3d float" src="assets/icons3d/trophy.webp" alt="" width="120" height="120">
      <h2 id="plDoneTitle">Well done!</h2>
      <p>Every move is a deposit in your bone bank.</p>
      <div class="pl-done-stats">
        <div><b id="plDoneMoves">0</b><span>Moves</span></div>
        <div><b id="plDoneMinutes">0</b><span>Minutes</span></div>
        <div><b id="plDoneStreak">0</b><span>Day streak</span></div>
      </div>
      <ul class="pl-done-list" id="plDoneList"></ul>
      <button class="cta-btn cta-lg" onclick="BoneApp.closePlayer(true)">Done</button>
    </div>
  </div>
'''
s, n = re.subn(r'  <!-- =+\n       WORKOUT TIMER\n       =+ -->\n  <div class="modal-backdrop" id="workoutTimerModal".*?\n    </div>\n  </div>\n',
               new_ui, s, count=1, flags=re.S)
if n != 1:
    raise SystemExit('timer modal not found')

p.write_text(s, encoding='utf-8')
print('index.html updated')
