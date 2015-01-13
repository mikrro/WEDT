def analyse(paragraphs):
    the_same_begin = []
    same = []
    chars = []
    ch = ''

    for i, para in enumerate(paragraphs):
        if ch != para[0]:
            if same:
                the_same_begin.append(same)
                same = []
            ch = para[0]
        elif not ch.isalnum() and not ch.isspace():
            # same.append(i-1)
            same.append(i)
            chars.append(ch)

    print the_same_begin
    print chars

    for the_same in reversed(the_same_begin):
        for s in reversed(the_same):
            if s - 1 > 0 :
                # print '%d %d' % (s-1,s)
                paragraphs[s-1] = paragraphs[s-1] +'\n<b>' + paragraphs[s]
                # paragraphs[s-1] += '\n' + paragraphs[s]
                del paragraphs[s]



