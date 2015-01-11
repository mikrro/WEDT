import re


def match_regex(paragraph, short_begins_pattern):

    if paragraph.isupper:
        return True

    for short in short_begins_pattern:
        if re.match(short, paragraph.lower(), re.I | re.U | re.S):
            print "<Begin pattern>" + paragraph
            return True
    print "<Not begin pattern>" + paragraph

    return False


def merge_shorter_than(paragraphs, min_size):
    short_begins_pattern =  ['.*rozdzia.*', '.*spis tre.*','.*bibliogra.*']
    short_begins_pattern += ['.*dodat.*','.*podsumowanie.*','.*wst.p.*']
    short_begins_pattern += ['.*podzi.kowania.*','.*table of contents.*']
    short_begins_pattern += ['.*chapter.*','.*appendix.*','.*introduction.*','.*section.*']

    index = 1
    while index < len(paragraphs):
        if len(paragraphs[index]) < min_size:
            if match_regex(paragraphs[index], short_begins_pattern) and index + 1 < len(paragraphs):
                paragraphs[index] = paragraphs[index] + '\n' + paragraphs[index+1]
                del paragraphs[index+1]
            else:
                paragraphs[index - 1] = paragraphs[index - 1] + paragraphs[index]
                del paragraphs[index]
        else:
            index += 1