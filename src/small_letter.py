def analyse(paragraphs):
    index = 0
    while index + 1 < len(paragraphs):

        substr = paragraphs[index][-5:-1]

        if '-' in substr or '.' not in substr or ',' in substr:
            inner_index = 0

            # print repr(paragraphs[index+1]) + '\n'

            while paragraphs[index + 1][inner_index].isalnum() is False and inner_index < len(paragraphs[index + 1]):
                inner_index += 1

            ch = paragraphs[index + 1][inner_index]

            if ch.islower():
                paragraphs[index] = paragraphs[index] + " " + paragraphs[index + 1]
                # paragraphs[index] = paragraphs[index] + '\n<s>' + paragraphs[index + 1] + '</s>'
                del paragraphs[index + 1]
            else:
                index += 1
        else:
            index += 1