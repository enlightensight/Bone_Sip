"""Use the animated coach characters wherever a move has no filmed video."""
import pathlib

p = pathlib.Path('js/app.js')
s = p.read_bytes().decode('utf-8').replace('\r\n', '\n')


def rep(old, new):
    global s
    if s.count(old) != 1:
        raise SystemExit(f'app.js: expected one match for {old[:80]!r}, found {s.count(old)}')
    s = s.replace(old, new)


# Helpers + thumbnails.
rep("""  function exThumbHtml(ex, size = 'sm') {
    const poster = exPosterSrc(ex);""", """  function hasCharacter(ex) {
    return !!(ex && window.BoneCharacter && window.BoneCharacter.has(ex.id));
  }

  function charAnimHtml(ex) {
    return `<div class="char-anim" data-anim="${ex.id}"></div>`;
  }

  function mountCharacters(root, opts = {}) {
    if (window.BoneCharacter && root) window.BoneCharacter.mountAll(root, Object.assign({ gender: state.selectedCoach }, opts));
  }

  function setCharactersPaused(root, paused) {
    if (window.BoneCharacter && root) window.BoneCharacter.setPaused(root, paused);
  }

  function exThumbHtml(ex, size = 'sm') {
    const poster = exPosterSrc(ex);
    if (!poster && hasCharacter(ex)) {
      return `<div class="wk-thumb ${size} anim">${charAnimHtml(ex)}</div>`;
    }""")

# The "Steps" marker only applies when there's neither a video nor an animation.
rep("""${ex.level}${ex.video ? '' : ' · <i class="fa-solid fa-list-ol"></i> Steps'}</small>""",
    """${ex.level}${ex.video || hasCharacter(ex) ? '' : ' · <i class="fa-solid fa-list-ol"></i> Steps'}</small>""")
rep("""      setupLazyVideos(root);
    } catch (err) {""", """      setupLazyVideos(root);
      mountCharacters(root);
    } catch (err) {""")

# Pause list media while a sheet/player covers it; resume afterwards.
rep("""  function pauseAllCardVideos() {
    document.querySelectorAll('#buildSubViewExercise video').forEach(v => v.pause());""",
    """  function pauseAllCardVideos() {
    document.querySelectorAll('#buildSubViewExercise video').forEach(v => v.pause());
    setCharactersPaused(document.getElementById('buildSubViewExercise'), true);""")
rep("""    if (root && root.style.display !== 'none') setupLazyVideos(root);""",
    """    if (root && root.style.display !== 'none') {
      setupLazyVideos(root);
      setCharactersPaused(root, false);
    }""")

# Detail sheet.
rep("""          : `<div class="exd-illus">${img3d(ex.img || 'running', 'float', 110)}<span><i class="fa-solid fa-list-ol"></i> Follow the steps below</span></div>`}""",
    """          : hasCharacter(ex)
            ? `<div class="exd-anim">${charAnimHtml(ex)}</div>`
            : `<div class="exd-illus">${img3d(ex.img || 'running', 'float', 110)}<span><i class="fa-solid fa-list-ol"></i> Follow the steps below</span></div>`}""")
rep("""        <ul class="exd-benefits">${(ex.benefits || []).map(b => `<li><i class="fa-solid fa-circle-check"></i>${b}</li>`).join('')}</ul>
      </div>`;""", """        <ul class="exd-benefits">${(ex.benefits || []).map(b => `<li><i class="fa-solid fa-circle-check"></i>${b}</li>`).join('')}</ul>
      </div>`;
    mountCharacters(body);""")

# Player: animated coach for moves without video; reuse it between ready → work.
rep("""    } else {
      media.innerHTML = `
        <div class="pl-illus">
          ${img3d(ex.img || 'running', 'float', 96)}
          <ol>${(ex.how || []).map(s => `<li>${s}</li>`).join('')}</ol>
        </div>`;
    }
  }""", """    } else if (hasCharacter(ex)) {
      let host = media.querySelector(`[data-anim="${ex.id}"]`);
      if (!host) {
        media.innerHTML = `<div class="pl-anim">${charAnimHtml(ex)}</div>`;
        host = media.querySelector('[data-anim]');
        mountCharacters(media, { paused: !autoplay });
        if (window.BoneCharacter) window.BoneCharacter.restart(host);
      }
      setCharactersPaused(media, !autoplay);
    } else {
      media.innerHTML = `
        <div class="pl-illus">
          ${img3d(ex.img || 'running', 'float', 96)}
          <ol>${(ex.how || []).map(s => `<li>${s}</li>`).join('')}</ol>
        </div>`;
    }
  }""")
rep("""    if (v) {
      if (player.paused) v.pause();
      else if (player.phase === 'work') v.play().catch(() => {});
    }
    if (player.paused && 'speechSynthesis' in window) window.speechSynthesis.cancel();""",
    """    if (v) {
      if (player.paused) v.pause();
      else if (player.phase === 'work') v.play().catch(() => {});
    }
    setCharactersPaused(document.getElementById('plMedia'), player.paused || player.phase !== 'work');
    if (player.paused && 'speechSynthesis' in window) window.speechSynthesis.cancel();""")
rep("""    if (player.phase === 'rest' && next) {
      const v = document.getElementById('plVideo');
      if (v) v.pause();""", """    if (player.phase === 'rest' && next) {
      const v = document.getElementById('plVideo');
      if (v) v.pause();
      setCharactersPaused(document.getElementById('plMedia'), true);""")
rep("""        prev.innerHTML = poster ? `<img src="${poster}" alt="">` : img3d(next.img || 'running', 'float', 110);
      }""", """        prev.innerHTML = poster ? `<img src="${poster}" alt="">` : (hasCharacter(next) ? `<div class="pl-anim">${charAnimHtml(next)}</div>` : img3d(next.img || 'running', 'float', 110));
        mountCharacters(prev);
      }""")
rep("""    if (player.phase === 'done') {
      const v = document.getElementById('plVideo');
      if (v) v.pause();""", """    if (player.phase === 'done') {
      const v = document.getElementById('plVideo');
      if (v) v.pause();
      setCharactersPaused(document.getElementById('plMedia'), true);""")

p.write_bytes(s.replace('\n', '\r\n').encode('utf-8'))
print('app.js wired')

# index.html: load the character engine before app.js
h = pathlib.Path('index.html')
t = h.read_text(encoding='utf-8')
old = '  <script src="js/data.js?v=3.0"></script>\n'
if t.count(old) != 1:
    raise SystemExit('data.js script tag not found')
t = t.replace(old, old + '  <script src="js/character.js?v=3.1"></script>\n')
h.write_text(t, encoding='utf-8')
print('index.html updated')

# CSS
c = pathlib.Path('css/brand.css')
u = c.read_text(encoding='utf-8')
u += """
/* Animated coach characters (js/character.js) */
.char-anim { width: 100%; height: 100%; }
.char-svg { display: block; width: 100%; height: 100%; }
.wk-thumb.anim { background: #EFEFEF; }
.wk-thumb.anim .char-anim { position: absolute; inset: 0; }
.exd-anim, .pl-anim { position: absolute; inset: 0; background: #EFEFEF; padding: 10px 0 0; }
.pl-rest-preview .pl-anim { padding-top: 6px; }
"""
c.write_text(u, encoding='utf-8')
print('css updated')
