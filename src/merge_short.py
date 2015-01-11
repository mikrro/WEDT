def merge_shorter_than(paragraphs, min_size, index = 0):
    if index + 1 >= len(paragraphs):
            return paragraphs

    if len(paragraphs[index + 1]) < min_size:
            paragraphs[index] = paragraphs[index] + paragraphs[index + 1]
            del paragraphs[index + 1]
            return merge_shorter_than(paragraphs, min_size, index)

    return merge_shorter_than(paragraphs, min_size, index + 1)