"""One-shot remap of the legacy green/blue/gold palette to the BONE SIP logo palette."""
import re, pathlib
HEX = {
 # Build (was forest green) -> logo pink
 '0E5A4A':'D6265A','0A4236':'B1315D','167A65':'E5305F','0A3F34':'B1315D','093D32':'B1315D',
 '0E362C':'2A2540','E3EEE9':'FDECF1','C3DCD2':'F8C8D5','EAF2ED':'FFE4EC','E8F4F0':'FDF0F4',
 'EBF5F1':'FDF0F4','E8F3EE':'FDF0F4','F4F9F6':'FDF0F4','F3F8F5':'FDF0F4','F0F6F4':'FDF0F4',
 'D8E5DC':'F8D5DF','D6E5DF':'F8D5DF','76AFA0':'F08AA6',
 # semantic risk colours stay semantic, just cleaner
 '2F7D6D':'1E9E62','A83232':'DC2626',
 # Surfaces & ink -> navy-tinted neutrals
 'FFFDF8':'FFFFFF','1B1A17':'2A2540','2D2B26':'2A2540','E2DACB':'E7E3EF','D1C7B7':'D6D0E3',
 'A89F8E':'B4AECA','C4BCAC':'CFC9DE','D5CEBF':'CFC9DE','D8D2C4':'CFC9DE','DDD5C7':'CFC9DE',
 '5E5A52':'6B6580','4A463E':'4A4560','3F3B34':'433D5A','7A756D':'7D7893','7A756B':'7D7893',
 '8A857B':'7D7893','8C867A':'7D7893','F4EFE6':'F8F6FB','FAF7F0':'FAF9FC','FAF7F2':'FAF9FC',
 'FBF9F4':'FAF9FC','FAF6EE':'FAF9FC','F8F5EE':'FAF9FC','F8F3EA':'FAF9FC','F3EFE8':'FAF9FC',
 'FCFDFB':'FAF9FC','EAE5DC':'EFECF5','EAE3D5':'EFECF5','EFECE6':'EFECF5','EBE5DB':'EFECF5',
 'E8E2D6':'EFECF5','F0ECE4':'EFECF5','EAE3D2':'EFECF5','EDE3D1':'EFECF5',
 # Protect (was slate blue) -> logo navy/indigo
 '1D4A7A':'4A3F7A','133355':'332D4B','255F9E':'6A5DA8','E1E9F3':'EEEBF7','F1F6FB':'EEEBF7','BFD3E8':'D6D0EA',
 # Strengthen (was amber gold) -> logo berry/plum
 '8A5F14':'8E2C6A','68460D':'6E1F51','E9C98A':'F3B5CF','F3E8D3':'F7E8F1','FDF4E6':'F7E8F1','E8D5B0':'EBCBDD',
}
RGB = {
 (14,90,74):(214,38,90),(27,26,23):(42,37,64),(255,253,248):(255,255,255),(29,74,122):(74,63,122),
 (233,201,138):(243,181,207),(244,239,230):(248,246,251),(138,95,20):(142,44,106),
}
hex_re = re.compile(r'#([0-9a-fA-F]{6})\b')
rgb_re = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)')
def sub_hex(m):
    k = m.group(1).upper(); return '#' + HEX[k] if k in HEX else m.group(0)
def sub_rgb(m):
    t = tuple(int(x) for x in m.groups())
    if t not in RGB: return m.group(0)
    head = m.group(0)[:m.group(0).index('(')+1]
    return head + ', '.join(str(v) for v in RGB[t])
for f in ['css/style.css','js/app.js','js/data.js','index.html']:
    p = pathlib.Path(f); s = p.read_text(encoding='utf-8')
    n = len(hex_re.findall(s))
    s2 = rgb_re.sub(sub_rgb, hex_re.sub(sub_hex, s))
    p.write_text(s2, encoding='utf-8')
    print(f, 'hex refs', n, 'changed', sum(1 for a,b in zip(s.splitlines(), s2.splitlines()) if a!=b), 'lines')
