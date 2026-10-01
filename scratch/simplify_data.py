"""Attach 3D illustration keys to choice data and shorten copy. Fails loudly if a target is missing."""
import pathlib, re

p = pathlib.Path('js/data.js')
s = p.read_bytes().decode("utf-8").replace(chr(13)+chr(10), chr(10))


def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f'expected {count} match(es), found {n}: {old[:80]!r}')
    s = s.replace(old, new)


# ---- Onboarding: shorter copy + illustration sets ----
rep('''      tag: "YOUR LIFE PORTFOLIO",
      title: "Your bones hold up everything you plan for.",
      description: "Every trip, every walk, every family moment rests on one foundation.",
      theme: "green",''', '''      tag: "YOUR LIFE PORTFOLIO",
      title: "Your bones carry your whole life.",
      description: "Every trip, walk and hug rests on them.",
      theme: "green",
      art: ["bone", "airplane", "hug", "running"],''')
rep('''      tag: "THREE MOVES",
      title: "Build. Protect. Strengthen.",
      description: "Build bone capital with food and movement, protect it from falls, and review it with your doctor.",
      theme: "blue",''', '''      tag: "THREE MOVES",
      title: "Build. Protect. Strengthen.",
      description: "Eat & move. Prevent falls. Check in with your doctor.",
      theme: "blue",
      art: ["biceps", "shield", "chart"],''')
rep('''      tag: "SMALL DAILY SIPS",
      title: "A plan that fits your plate and your day.",
      description: "A personalised meal plan, guided exercises and gentle reminders. No sign-up to start.",
      theme: "gold",''', '''      tag: "SMALL DAILY SIPS",
      title: "Small daily steps. Big returns.",
      description: "Meals, moves and reminders made for you. No sign-up to start.",
      theme: "gold",
      art: ["phone", "milk", "bell", "fire"],''')

# ---- Life assets: drop inline SVGs, add 3D art ----
s, n = re.subn(r'\r?\n\s*svg: `<svg[^`]*`', '', s, count=6)
if n != 6:
    raise SystemExit(f'expected 6 asset svgs, removed {n}')
s = s.replace('\r\n', '\n')
for asset_id, img, title_old, title_new in [
    ('asset_travel', 'airplane', 'Freedom to travel', 'Travel'),
    ('asset_independence', 'house', 'Independence in daily life', 'Independence'),
    ('asset_family', 'hug', 'Time with family & friends', 'Family time'),
    ('asset_active', 'running', 'Active lifestyle', 'Staying active'),
    ('asset_confidence', 'walking', 'Confidence to move freely', 'Moving freely'),
    ('asset_quality', 'hearts', 'Quality of life', 'Joy of life'),
]:
    rep(f'id: "{asset_id}",\n      title: "{title_old}",', f'id: "{asset_id}",\n      title: "{title_new}",\n      img: "{img}",')

# ---- Diet pattern ----
for img, desc_old, desc_new in [
    ('salad', 'Dairy, pulses and grains. No eggs or meat.', 'Dairy, dal & grains'),
    ('egg', 'Vegetarian, plus eggs.', 'Veg + eggs'),
    ('poultry', 'Includes eggs, fish and chicken.', 'Eggs, fish & chicken'),
    ('seedling', 'Fully plant-based. No dairy.', '100% plant-based'),
]:
    rep(f'description: "{desc_old}"', f'description: "{desc_new}",\n      img: "{img}"')

# ---- Regional cuisine ----
for img, desc_old, desc_new in [
    ('flatbread', 'Paneer, Ragi/Atta rotis, Curd, Rajma, Methi/Sarson saag, Til chikki', 'Paneer · Roti · Saag'),
    ('curry', 'Ragi mudde/dosa, Curd rice, Drumstick sambar, Sesame podi, Sundal', 'Ragi dosa · Curd rice'),
    ('stuffed', 'Dhokla, Methi thepla, Jowar/Bajra bhakri, Sprouted usal, Til ladoo', 'Thepla · Bhakri · Dhokla'),
    ('fish', 'Fish curry, Posto, Chhena, Mustard greens, Soyabean', 'Fish · Chhena · Greens'),
    ('globe', 'Greek yogurt, Tofu scramble, Chia pudding, Green salads', 'Yogurt · Tofu · Salads'),
]:
    rep(f'description: "{desc_old}"', f'description: "{desc_new}",\n      img: "{img}"')
rep('title: "West & Central Indian"', 'title: "West & Central"')
rep('title: "East & North-East Indian"', 'title: "East & North-East"')
rep('title: "Continental & Global"', 'title: "Global"')

# ---- Activity ----
for img, title_old, title_new, desc_old, desc_new in [
    ('laptop', 'Sedentary / Desk Work', 'Mostly sitting', 'Under 3,000 steps/day. Mostly seated during work hours.', 'Under 3k steps'),
    ('walking', 'Lightly Active', 'Lightly active', '3,000–6,000 steps/day. Leisure walks, light household movement.', '3k–6k steps'),
    ('running', 'Moderately Active', 'Moderately active', '6,000–10,000 steps/day. Brisk walking, yoga, or workouts 3x/week.', '6k–10k steps'),
    ('weights', 'Highly Active / Heavy Movement', 'Very active', 'Over 10,000 steps/day. Physical labor, running, or intensive sports.', '10k+ steps'),
]:
    rep(f'title: "{title_old}",\n      description: "{desc_old}"', f'title: "{title_new}",\n      description: "{desc_new}",\n      img: "{img}"')

# ---- Health conditions ----
for img, title_old, title_new, desc_old, desc_new in [
    ('bandage', 'Previous fracture after age 40', 'Fracture after 40', 'Minor slip or standing fall resulting in bone fracture', 'From a minor fall'),
    ('family', 'Family history of osteoporosis', 'Family history', 'Parent or sibling had fragility fracture or stooped posture', 'Parent or sibling'),
    ('hourglass', 'Menopause / Post-menopausal', 'Menopause', 'Natural estrogen reduction accelerates bone mineral loss', 'Or post-menopause'),
    ('pill', 'Joint stiffness / Thyroid / Long-term meds', 'Thyroid / long-term meds', 'Frequent aches or medications affecting bone calcium uptake', 'Or joint stiffness'),
    ('check', 'None of the above', 'None of these', 'Standard preventative health maintenance and bone care', 'Prevention only'),
]:
    rep(f'title: "{title_old}",\n      description: "{desc_old}"', f'title: "{title_new}",\n      description: "{desc_new}",\n      img: "{img}"')

# ---- Protect portfolio, risk factors, rooms ----
rep('{ title: "Balance assets", desc: "Strong muscles, better stability, lower fall risk." }', '{ title: "Balance", desc: "Strong legs, steady steps", img: "lotus" }')
rep('{ title: "Home security", desc: "Loose rugs, dim lights, clutter and slippery floors, gone." }', '{ title: "Safe home", desc: "No rugs, clutter or dark corners", img: "house" }')
rep('{ title: "Mobility support", desc: "Well-fitting shoes with good grip. Skip loose slippers." }', '{ title: "Good shoes", desc: "Grip soles, no loose slippers", img: "shoe" }')
rep('{ title: "Sensory checks", desc: "Vision and hearing keep every step informed." }', '{ title: "Eyes & ears", desc: "Regular vision & hearing checks", img: "glasses" }')
for rid, img, t_old, t_new in [
    ('risk_fall', 'warning', 'A fall in the last 12 months', 'Fell in the last year'),
    ('risk_unsteady', 'cane', 'Unsteady when walking', 'Unsteady walking'),
    ('risk_dizziness', 'dizzy', 'Dizziness', 'Dizziness'),
    ('risk_fear', 'fearful', 'Fear of falling', 'Fear of falling'),
    ('risk_vision', 'glasses', 'Vision concerns', 'Vision problems'),
    ('risk_meds', 'pill', 'Taking several medicines', '4+ daily medicines'),
]:
    rep(f'{{ id: "{rid}", text: "{t_old}" }}', f'{{ id: "{rid}", text: "{t_new}", img: "{img}" }}')
for room, img in [('Bedroom', 'bed'), ('Bathroom', 'bathtub'), ('Stairs', 'ladder'), ('Kitchen', 'cooking'), ('Living room', 'couch')]:
    key = f'name: "{room}",\n      icon:'
    rep(key, f'name: "{room}",\n      img: "{img}",\n      icon:', count=max(1, s.count(key)))

# Shorter home-audit questions
for old, new in [
    ('Is the pathway from bed to door completely free of loose rugs and cables?', 'Bed-to-door path free of rugs & cables?'),
    ('Can you switch on a bedside light without getting up in the dark?', 'Bedside light within reach?'),
    ('Are your feet flat on the floor when sitting on the edge of the bed?', 'Feet flat on floor when sitting on bed?'),
    ('Grab bars near the toilet and shower?', 'Grab bars near toilet & shower?'),
    ('Non-slip mats or floor surfaces?', 'Non-slip mats on the floor?'),
    ('Bright enough lighting, including at night?', 'Bright light, even at night?'),
    ('Sturdy handrails on both sides of every staircase?', 'Handrails on both sides?'),
    ('Non-slip edges on steps with zero clutter?', 'Non-slip, clutter-free steps?'),
    ('Bright lighting with switches at top and bottom?', 'Light switches at top & bottom?'),
    ('Daily pots and staples stored between waist and shoulder height?', 'Daily items between waist & shoulder?'),
    ('Non-skid floor mats placed near the sink and prep counter?', 'Non-skid mat near the sink?'),
    ('Immediate cleanup protocol for liquid or oil spills?', 'Spills wiped up right away?'),
    ('All loose throw rugs removed or taped down with non-skid backing?', 'Loose rugs removed or taped?'),
    ('All wires and phone chargers safely tucked against walls?', 'Wires tucked along walls?'),
    ('Wide, clear walking paths between sofas and doorways?', 'Clear paths between furniture?'),
]:
    rep(f'text: "{old}"', f'text: "{new}"')

# ---- Doctor checklist ----
for did, img in [('doc_risk', 'target'), ('doc_dxa', 'xray'), ('doc_loss', 'chart'), ('doc_fracture', 'bandage'), ('doc_strengthen', 'biceps'), ('doc_treatment', 'pill')]:
    rep(f'{{ id: "{did}", text:', f'{{ id: "{did}", img: "{img}", text:')

p.write_bytes(s.replace('\n', '\r\n').encode('utf-8'))
print('data.js updated OK')
