def remove_extension(file_name):
    if file_name[-4] == '.':
        return file_name[:-4]
    elif file_name[-5] == '.':
        return file_name[:-5]
    return 'default'

def is_html(file_name):
    if file_name[-5] == '.':
        return True