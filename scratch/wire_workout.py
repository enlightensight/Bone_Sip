"""Wire the guided-workout module into scoring, persistence, exports and keyboard handling."""
import pathlib

p = pathlib.Path('js/app.js')
s = p.read_bytes().decode('utf-8').replace('\r\n', '\n')


def rep(old, new, count=1):
    global s
    if s.count(old) != count:
        raise SystemExit(f'expected {count} of {old[:80]!r}, found {s.count(old)}')
    s = s.replace(old, new)


# Daily exercise goal is 4 moves (one per focus group).
rep("    const activeExCount = state.activeExerciseRoutine.length || 4;",
    "    const activeExCount = getDailyExerciseTarget();")
rep("    const exTarget = getActiveExerciseList().length || 5;",
    "    const exTarget = getDailyExerciseTarget();", count=2)
rep("    if (!wasDone && set.size >= getActiveExerciseList().length) {",
    "    if (!wasDone && set.size >= getDailyExerciseTarget()) {")

# Persist chosen focus group and custom durations.
rep("""          selectedCoach: state.selectedCoach,
""", """          selectedCoach: state.selectedCoach,
          exerciseGroup: state.exerciseGroup,
          exerciseDurations: state.exerciseDurations || {},
""")
rep("""        if (data.selectedCoach) state.selectedCoach = data.selectedCoach;
""", """        if (data.selectedCoach) state.selectedCoach = data.selectedCoach;
        if (data.exerciseGroup) state.exerciseGroup = data.exerciseGroup;
        if (data.exerciseDurations && typeof data.exerciseDurations === 'object') state.exerciseDurations = data.exerciseDurations;
""")

# Escape ends the player (with confirmation) before closing modals.
rep("""      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => {""", """      if (e.key === 'Escape') {
        const playerEl = document.getElementById('workoutPlayer');
        if (playerEl && !playerEl.hidden) {
          closePlayer(player.phase === 'done');
          return;
        }
        document.querySelectorAll('.modal-backdrop').forEach(m => {""")

# Coach switch must also refresh the open detail sheet.
rep("""  function switchGlobalCoach(gender) {
    playSound('tap');
    state.selectedCoach = gender;""", """  function switchGlobalCoach(gender) {
    playSound('tap');
    state.selectedCoach = gender;
    BoneDB.save();""")

# Public API.
rep("""    openWorkoutTimerModal,
""", """    openWorkoutTimerModal,
    selectExerciseGroup,
    openExerciseDetail,
    closeExerciseDetail,
    startDetailExercise,
    adjustExerciseDuration,
    startWorkout,
    playerTogglePause,
    playerSkip,
    playerAddRest,
    closePlayer,
    toggleVoice,
""")

p.write_bytes(s.replace('\n', '\r\n').encode('utf-8'))
print('wired')
