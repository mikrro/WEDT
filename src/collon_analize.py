def analyse(paragraphs):
    index = 0
    found_colon = False
    while index + 1 < len(paragraphs):

        if paragraphs[index][-1] == ':' or ':' in paragraphs[index][-5:-1] or found_colon:
            inner_index = 0

            # print repr(paragraphs[index+1]) + '\n'

            while paragraphs[index + 1][inner_index] != '\"' and \
            paragraphs[index + 1][inner_index].isalnum() is False and inner_index < len(paragraphs[index + 1]):
                inner_index += 1

            ch = paragraphs[index + 1][inner_index]

            if not ch.isupper():
                found_colon = True
                paragraphs[index] = paragraphs[index] +  paragraphs[index + 1]
                # paragraphs[index] = paragraphs[index] + '\n<c>' + paragraphs[index + 1] + '</c>'
                del paragraphs[index + 1]

            else:
                found_colon = False
                index += 1
        else:
            index += 1