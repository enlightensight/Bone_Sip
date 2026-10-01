"""Align the legacy e2e suite with v4 behaviour and add regression tests for the security fixes."""
import pathlib

p = pathlib.Path('scratch/test_runner_e2e.js')
s = p.read_bytes().decode('utf-8').replace('\r\n', '\n')

BS = '\\'  # a single backslash, as it appears in the JS source (user\'s)

reps = [
    ("    style: {},",
     "    style: { setProperty: function(k, v) { this[k] = v; }, getPropertyValue: function(k) { return this[k] || ''; } },"),
    ("assert(chatStrip.innerHTML.includes('Guest User (Not Logged In)'), 'Chat context strip displays \"Guest User (Not Logged In)\"');",
     "assert(chatStrip.innerHTML.includes('Guest'), 'Chat context strip identifies an unauthenticated user as \"Guest\"');"),
    ("assert(reportContainer.innerHTML.includes('Guest User'), 'Progressive report identifies unauthenticated state as \"Guest User\"');",
     "assert(reportContainer.innerHTML.includes('Guest'), 'Progressive report identifies unauthenticated state as \"Guest\"');"),
    (f"  assert(updatedStrip.includes('+91 9820012345'), 'Chat strip dynamically updates with user{BS}'s real phone');",
     "  // v4: a number typed into the profile is only contact info; it must NOT count as an OTP login.\n"
     "  const savedAfterProfile = JSON.parse(mockLocalStorage.getItem('BONE_SIP_PRODUCTION_DB_V3'));\n"
     "  assert(savedAfterProfile.auth.isVerified !== true, 'Security: typing a phone in Profile does not bypass OTP verification');\n"
     "  assert(!updatedStrip.includes('9820012345'), 'Privacy: chat strip never shows a full phone number');"),
    (f"  assert(updatedReport.includes('Patient: Dr. Rajesh Patel'), 'Health report displays user{BS}'s real name');\n"
     f"  assert(updatedReport.includes('+91 9820012345'), 'Health report displays user{BS}'s real phone');",
     f"  assert(updatedReport.includes('Dr. Rajesh Patel'), 'Health report displays user{BS}'s real name');\n"
     "  assert(!/-\\d+%/.test(updatedReport), 'Health report contains no invented fracture-risk reduction percentages');\n"
     "\n"
     "  // Security: chat must render typed HTML as text.\n"
     "  mockElements['chatTextInput'].value = '<img src=x onerror=\"alert(1)\">';\n"
     "  BoneApp.sendChatMessage();\n"
     "  const chatAfterXss = mockElements['chatMessagesContainer'].innerHTML;\n"
     "  assert(!chatAfterXss.includes('<img src=x'), 'Security: chat escapes user-typed HTML');\n"
     "  assert(chatAfterXss.includes('&lt;img src=x'), 'Security: escaped HTML is still visible as text');"),
    ("assert(parsedDB.version === 3, 'BoneDB schema is version 3');",
     "assert(parsedDB.version === 4, 'BoneDB schema is version 4');"),
    ("    clearInterval: clearInterval,\n    console: console\n  };\n  reloadSandbox.window.window",
     "    clearInterval: clearInterval,\n    console: console,\n"
     "    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 0),\n"
     "    cancelAnimationFrame: (id) => clearTimeout(id),\n"
     "    performance: { now: () => Date.now() }\n  };\n  reloadSandbox.window.window"),
]
for old, new in reps:
    if s.count(old) != 1:
        raise SystemExit(f'missing: {old[:90]!r}')
    s = s.replace(old, new)

p.write_bytes(s.replace('\n', '\r\n').encode('utf-8'))
print('test updated')
