def parse_document(document, l):
    end = False

    paragraph_begin = 0
    paragraph_end = len(document) - 1
    state = 1

    i = 0
    while i < len(document):
        ch = document[i]

        if ch == '\n':
            end = True

            while i+1 < (len(document) - 1) and document[i+1] == '\r':
                i = i + 1
                # print 'Skiping ' + repr(document[i]) + " " + str(i)


        if state == 1:
            if ~ch.isspace():
                state = 2
                paragraph_begin = i


        elif state == 2:
            if end:
                end = False
                paragraph_end = i
                state = 3


        elif state == 3:
            if end:
                state = 1
                end = False
                l.paragraph(paragraph_begin, paragraph_end)
            else:
                state = 2
        i = i + 1

    paragraph_end = len(document) - 1

    if state == 2 or state == 3:
        l.paragraph(paragraph_begin, paragraph_end)

