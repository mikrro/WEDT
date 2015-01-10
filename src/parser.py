import label


def parse_document(document):
    end = False

    l = label.Label(document)

    paragraph_begin = 0
    paragraph_end = len(document) - 1
    state = 1

    for i, ch in enumerate(document):

        if ch == '\n':
            end = True

            while i+1 < (len(document) - 1) and document[i+1] == '\r':
                i = i + 1

            ch = document[i]

        if state == 1:
            if ch == '\n' or ~ch.isspace():
                state = 2
                paragraph_begin = i
            continue

        if state == 2:
            if end:
                end = False
                paragraph_end = i
                state = 3
            continue

        if state == 3:
            print 'State ' + str(state) + ' end ' + str(end)
            if end:
                state = 1
                end = False
                l.paragraph(paragraph_begin, paragraph_end)
            else:
                state = 2
            continue

    paragraph_end = len(document) - 1

    if state == 2 or state == 3:
        l.paragraph(paragraph_begin, paragraph_end)

    l.print_text()
    l.print_labeled()
    l.write_to_file()