class Label:
    def __init__(self, document):
        """
        :rtype : String
        """
        self.text = document
        self.labeled_text = ''
        self.paragraph_list = []
        self.max_line_width = 0

    def paragraph(self, begin, end):
        self.paragraph_list.append(self.text[begin:end])

    def find_max_line_width(self):
        max_paragraph = max(self.paragraph_list, key=len)
        max_line = max(max_paragraph.split('\n'), key=len)
        return len(max_line)

    def create_labeled(self):
        for para in self.paragraph_list:
            self.labeled_text += '<p>'
            self.labeled_text += para
            self.labeled_text += '</p>'
            self.labeled_text += '\n'

    def print_text(self):
        print repr(self.text)

    def print_list(self):
        for para in self.paragraph_list:
            print para + '\n'

    def print_labeled(self):
        print repr(self.labeled_text)

    def write_to_file(self):
        self.create_labeled()
        f = open('../samples/labeled.txt','w')
        f.write(self.labeled_text)
        f.close()
        f = open('../samples/unlabeled.txt','w')
        f.write(self.text)
        f.close()