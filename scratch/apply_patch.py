"""Replace named top-level functions inside js/app.js with the versions in scratch/app_patch.js.

Each patch segment starts with `//@@ replace <functionName>` and may contain extra helper
declarations after the function. The scanner understands strings, template literals (with
nested ${...}), comments and regex literals, so braces inside them don't confuse matching.
"""
import pathlib
import re
import sys

APP = pathlib.Path('js/app.js')
PATCH = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'scratch/app_patch.js')


def find_block_end(src, open_idx):
    """Given index of an opening '{', return index just past its matching '}'."""
    i, n = open_idx, len(src)
    depth = 0
    stack = []  # tracks template-literal nesting: 'tpl' entries mark `${` openings
    prev_sig = '{'
    while i < n:
        c = src[i]
        if c in ' \t\r\n':
            i += 1
            continue
        if src.startswith('//', i):
            i = src.index('\n', i)
            continue
        if src.startswith('/*', i):
            i = src.index('*/', i) + 2
            continue
        if c in '"\'':
            j = i + 1
            while src[j] != c:
                j += 2 if src[j] == '\\' else 1
            i = j + 1
            prev_sig = 'x'
            continue
        if c == '`':
            i = scan_template(src, i + 1)
            prev_sig = 'x'
            continue
        if c == '/' and prev_sig in '(,=:[!&|?{};+-*%<>~^':
            j = i + 1
            in_class = False
            while True:
                ch = src[j]
                if ch == '\\':
                    j += 2
                    continue
                if ch == '[':
                    in_class = True
                elif ch == ']':
                    in_class = False
                elif ch == '/' and not in_class:
                    break
                j += 1
            j += 1
            while j < n and src[j].isalpha():
                j += 1
            i = j
            prev_sig = 'x'
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return i + 1
        prev_sig = c if not (c.isalnum() or c in '_$') else 'x'
        i += 1
    raise ValueError('unbalanced braces')


def scan_template(src, i):
    """i points just after an opening backtick; return index just after closing backtick."""
    while True:
        c = src[i]
        if c == '\\':
            i += 2
            continue
        if c == '`':
            return i + 1
        if src.startswith('${', i):
            end = find_block_end(src, i + 1)
            i = end
            continue
        i += 1


def main():
    app = APP.read_bytes().decode('utf-8').replace('\r\n', '\n')
    patch = PATCH.read_bytes().decode('utf-8').replace('\r\n', '\n')
    segments = re.split(r'^//@@ replace (\w+)\n', patch, flags=re.M)
    replaced = []
    for k in range(1, len(segments), 2):
        name, body = segments[k], segments[k + 1].rstrip('\n') + '\n'
        m = list(re.finditer(rf'^  (?:async )?function {name}\(', app, flags=re.M))
        if len(m) != 1:
            sys.exit(f'{name}: expected exactly one definition, found {len(m)}')
        start = m[0].start()
        brace = app.index('{', app.index(')', start))
        end = find_block_end(app, brace)
        if end < len(app) and app[end] == '\n':
            end += 1
        app = app[:start] + body + app[end:]
        replaced.append(name)
    APP.write_bytes(app.replace('\n', '\r\n').encode('utf-8'))
    print(f'replaced {len(replaced)} functions:', ', '.join(replaced))


if __name__ == '__main__':
    main()
