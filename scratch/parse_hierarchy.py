from html.parser import HTMLParser

class TagParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.exercise_parent = None
        self.diet_parent = None

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        tag_id = attr_dict.get('id', '')
        tag_class = attr_dict.get('class', '')
        info = {'tag': tag, 'id': tag_id, 'class': tag_class, 'line': self.getpos()[0]}
        
        if tag_id == 'buildSubViewExercise':
            self.exercise_parent = list(self.stack)
        if tag_id == 'buildSubViewDiet':
            self.diet_parent = list(self.stack)
            
        if tag not in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            self.stack.append(info)

    def handle_endtag(self, tag):
        if tag not in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            for i in range(len(self.stack)-1, -1, -1):
                if self.stack[i]['tag'] == tag:
                    self.stack = self.stack[:i]
                    break

parser = TagParser()
with open('index.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())

print('Diet parent chain:')
for p in (parser.diet_parent or []):
    print(' ', p['tag'], 'id=' + p['id'], 'class=' + p['class'], 'line=' + str(p['line']))

print('\nExercise parent chain:')
for p in (parser.exercise_parent or []):
    print(' ', p['tag'], 'id=' + p['id'], 'class=' + p['class'], 'line=' + str(p['line']))
